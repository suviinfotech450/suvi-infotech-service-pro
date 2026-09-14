const ITEMS_KEY="SUVI_FRESH_ITEMS",
PURCHASE_KEY="SUVI_FRESH_PURCHASES",
SALES_KEY="SUVI_FRESH_SALES",
MOVE_KEY="SUVI_FRESH_MOVEMENTS",
SUP_KEY="SUVI_FRESH_SUPPLIERS",
ADJ_KEY="SUVI_FRESH_ADJUSTMENTS",
AUTO_KEY="SUVI_BARCODE_AUTO_ADD";

let items=load(ITEMS_KEY,[]),
purchases=load(PURCHASE_KEY,[]),
sales=load(SALES_KEY,[]),
movements=load(MOVE_KEY,[]),
suppliers=load(SUP_KEY,[]),
adjustments=load(ADJ_KEY,[]);

let selectedPurchaseId=null,
selectedInvoiceId=null,
selectedAdjustmentId=null,
purchaseLines=[],
invoiceLines=[],
ocrItems=[];

function load(k,d){
  try{return JSON.parse(localStorage.getItem(k))||d}
  catch(e){return d}
}

function save(k,v){
  localStorage.setItem(k,JSON.stringify(v))
}

function today(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

function money(n){
  return "₹"+Number(n||0).toLocaleString("en-IN",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  })
}

function esc(s){
  return String(s??"").replace(/[&<>"']/g,m=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#039;"
  }[m]))
}

function cap(s){
  return String(s||"").trim().replace(/\b\w/g,x=>x.toUpperCase())
}

function currentFY(){
  const d=new Date(),
  y=d.getFullYear(),
  m=d.getMonth()+1;

  return m>=4
    ?`${String(y).slice(-2)}-${String(y+1).slice(-2)}`
    :`${String(y-1).slice(-2)}-${String(y).slice(-2)}`
}

function nextItemCode(){

  const KEY="SUVI_ITEM_CODE_SEQUENCE";

  let current=
    Number(localStorage.getItem(KEY))||0;

  const maxExisting=
    items.reduce(
      (m,x)=>
        Math.max(
          m,
          parseInt(
            String(x.code||"").replace(/\D/g,"")
          )||0
        ),
      0
    );

  current=Math.max(current,maxExisting)+1;

  localStorage.setItem(KEY,String(current));

  return "INV"+String(current).padStart(2,"0");
}

function nextBarcode(){
  return "890"+Date.now().toString().slice(-10)
}

function nextInvoiceNo(){
  const fy=currentFY();
  let n=0;

  for(const s of sales){
    const m=String(s.invoiceNo||"").match(
      new RegExp(`^SUVI\\s${fy}\\/(\\d+)$`)
    );

    if(m)n=Math.max(n,+m[1]||0)
  }

  return `SUVI ${fy}/${String(n+1).padStart(2,"0")}`
}

function goBack(){
  if(history.length>1)history.back();
  else goDashboard()
}

function goDashboard(){
  location.href="../../dashboard.html"
}
/* =====================================================
   DYNAMIC FIRM NAME
   ===================================================== */

const inventoryFirmName =
    document.getElementById("inventoryFirmName");

if (inventoryFirmName) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        inventoryFirmName.textContent =
            "◆ " + selectedFirm.trim();
    }
}

function init(){

  document.querySelectorAll(".tab-btn").forEach(b=>{
    b.addEventListener("click",()=>{
      showTab(b.dataset.tab)
    })
  });

  const purchaseDate=document.getElementById("purchaseDate");
  if(purchaseDate)purchaseDate.value=today();

  const invoiceDate=document.getElementById("invoiceDate");
  if(invoiceDate)invoiceDate.value=today();

  const invoiceNo=document.getElementById("invoiceNo");
  if(invoiceNo)invoiceNo.value=nextInvoiceNo();

  const auto=document.getElementById("barcodeAutoAdd");

  if(auto){
    auto.checked=localStorage.getItem(AUTO_KEY)==="1";

    auto.onchange=e=>{
      localStorage.setItem(
        AUTO_KEY,
        e.target.checked?"1":"0"
      )
    }
  }

  renderAll()
}

function showTab(id){
  document.querySelectorAll(".tab-content")
    .forEach(x=>x.classList.toggle("active",x.id===id));

  document.querySelectorAll(".tab-btn")
    .forEach(x=>x.classList.toggle("active",x.dataset.tab===id))
}

function renderAll(){
  renderSummary();
  renderItems();
  updatePurchaseTotals();
  renderPurchaseHistory();
  renderInvoiceLines();
  updateInvoiceTotals();
  renderSalesHistory();
  renderStock();
  renderMovements();
  renderSuppliers();
  renderAdjustments();
  populateSupplierSelect();
}

function renderSummary(){

  const totalItems=document.getElementById("totalItems");
  const totalStock=document.getElementById("totalStock");
  const lowStock=document.getElementById("lowStock");
  const stockValue=document.getElementById("stockValue");

  if(totalItems)
    totalItems.textContent=items.length;

  if(totalStock)
    totalStock.textContent=
      items.reduce((s,x)=>s+Number(x.stock||0),0);

  if(lowStock)
    lowStock.textContent=
      items.filter(
        x=>Number(x.stock||0)<=Number(x.minStock||0)
      ).length;

  if(stockValue)
  stockValue.textContent=money(
    items.reduce(
      (s,x)=>s+
      (Number(x.stock) || 0) *
      (Number(x.purchaseRate) || 0) *
      1.18,
      0
    )
  )
}

function renderItems(){

  const q=(document.getElementById("itemSearch")?.value||"")
    .toLowerCase();

  const body=document.getElementById("itemBody");
  if(!body)return;

  const list=items.filter(x=>
    [x.code,x.name,x.hsn,x.barcode]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );

  body.innerHTML=list.map(x=>`
    <tr>
      <td>${esc(x.code)}</td>
      <td><b>${esc(x.name)}</b></td>
      <td>${esc(x.hsn || x.hsnCode || "-")}</td>
      <td>${esc(x.unit||"Nos")}</td>
      <td>${money(x.purchaseRate)}</td>
      <td>${money(x.saleRate)}</td>
      <td>${Number(x.stock)||0}</td>
      <td>${Number(x.minStock)||0}</td>
      <td>${esc(x.barcode||"-")}</td>
      <td>
        <button class="action-btn"
          onclick='printBarcode(${JSON.stringify(x.id)})'>
          Barcode
        </button>

        <button class="action-btn"
          onclick='editItem(${JSON.stringify(x.id)})'>
          Edit
        </button>

        <button class="action-btn danger-btn"
          onclick='deleteItem(${JSON.stringify(x.id)})'>
          Delete
        </button>
      </td>
    </tr>
  `).join("")||
  `<tr><td colspan="10" class="empty">No items found.</td></tr>`
}

function openItemForm(id=null){

  document.getElementById("itemModal").classList.add("show");

  document.getElementById("itemForm").reset();

  document.getElementById("itemModalTitle").textContent=
    id?"Edit Item":"Add Item";

  if(id){

    const x=items.find(i=>i.id===id);
    if(!x)return;

   document.getElementById("itemCode").value=x.code||"";
    document.getElementById("itemName").value=x.name;
    document.getElementById("itemHSN").value=x.hsn||"";
    document.getElementById("itemUnit").value=x.unit||"Nos";
    document.getElementById("itemPurchaseRate").value=x.purchaseRate||0;
    document.getElementById("itemSaleRate").value=x.saleRate||0;
    document.getElementById("itemStock").value=x.stock||0;
    document.getElementById("itemMinStock").value=x.minStock||0;
    document.getElementById("itemBarcode").value=x.barcode||"";

    document.getElementById("itemForm").dataset.editId=id;

    renderPreview(x.barcode)

  }else{

    document.getElementById("itemCode").value=nextItemCode();

    document.getElementById("itemBarcode").value=nextBarcode();

    document.getElementById("itemForm").dataset.editId="";

    renderPreview(
      document.getElementById("itemBarcode").value
    )
  }
}

function closeItemForm(){
  document.getElementById("itemModal").classList.remove("show")
}

function generateNewBarcode(){
  const b=nextBarcode();

  document.getElementById("itemBarcode").value=b;

  renderPreview(b)
}

function renderPreview(b){

  const p=document.getElementById("barcodePreview");
  const n=document.getElementById("barcodeNumber");

  if(p)
    p.innerHTML=
      b&&window.renderBarcodeSVG
      ?renderBarcodeSVG(b,360,75)
      :"";

  if(n)n.textContent=b||""
}

function saveItem(e){

  e.preventDefault();

  const f=document.getElementById("itemForm");
  const id=f.dataset.editId;

  const obj={
    id:id||crypto.randomUUID(),
    code:document.getElementById("itemCode").value,
    name:cap(document.getElementById("itemName").value),
    hsn:document.getElementById("itemHSN").value.trim(),
    unit:document.getElementById("itemUnit").value,
    purchaseRate:+document.getElementById("itemPurchaseRate").value||0,
    saleRate:+document.getElementById("itemSaleRate").value||0,
    stock:+document.getElementById("itemStock").value||0,
    minStock:+document.getElementById("itemMinStock").value||0,
    barcode:document.getElementById("itemBarcode").value.trim()
  };

  if(!obj.name)
    return alert("Enter item name.");

  const dup=items.find(
    x=>x.barcode===obj.barcode&&x.id!==obj.id
  );

  if(dup)
    return alert("Barcode already used by another item.");

  if(id){

    const old=items.findIndex(x=>x.id===id);

    obj.stock=
      Number(document.getElementById("itemStock").value)||0;

    items[old]=obj

  }else{

    items.push(obj)
  }

  save(ITEMS_KEY,items);

  closeItemForm();

  renderAll();

  alert("Item saved successfully.")
}

function editItem(id){
  openItemForm(id)
}

function deleteItem(id){

  const x=items.find(i=>i.id===id);

  if(!x)return;

  if(!confirm(`Delete ${x.name}?`))return;

  items=items.filter(i=>i.id!==id);

  save(ITEMS_KEY,items);

  renderAll()
}

function filterPurchaseItems(){

  const q=document.getElementById("purchaseItemSearch")
    .value.trim()
    .toLowerCase();

  const box=document.getElementById("purchaseSuggestions");

  if(!q){
    box.innerHTML="";
    return
  }

  const list=items.filter(x=>
    [x.name,x.barcode,x.code]
      .join(" ")
      .toLowerCase()
      .includes(q)
  ).slice(0,8);

  box.innerHTML=list.map(x=>`
    <div class="suggestion"
      onclick='selectPurchaseItem(${JSON.stringify(x.id)})'>

      <span>${esc(x.name)}</span>

      <span>
        ${esc(x.barcode||x.code)} • Stock ${x.stock}
      </span>

    </div>
  `).join("")||
  `<div class="suggestion">No item found</div>`
}

function selectPurchaseItem(id){

  const x=items.find(i=>i.id===id);

  if(!x)return;

  selectedPurchaseId=id;

  document.getElementById("purchaseItemSearch").value=x.name;
  document.getElementById("purchaseHSN").value=x.hsn||"";
  document.getElementById("purchaseUnit").value=x.unit||"Nos";
  document.getElementById("purchaseRate").value=x.purchaseRate||0;

  document.getElementById("selectedPurchaseItem").textContent=
    `Selected: ${x.name} | HSN: ${x.hsn||"-"} | Unit: ${x.unit||"Nos"}`;

  document.getElementById("purchaseSuggestions").innerHTML=""
}

function addPurchaseLine(){

  if(!selectedPurchaseId){

    const q=
      document.getElementById("purchaseItemSearch")
      .value.trim();

    const x=items.find(
      i=>
      i.name.toLowerCase()===q.toLowerCase()||
      i.barcode===q
    );

    if(x)selectPurchaseItem(x.id)
  }

  if(!selectedPurchaseId)
    return alert("Select a purchase item.");

  const x=items.find(
    i=>i.id===selectedPurchaseId
  );

  const qty=
    +document.getElementById("purchaseQty").value||0;

  const rate=
    +document.getElementById("purchaseRate").value||0;

  if(qty<=0)
    return alert("Enter valid quantity.");

  if(rate<0)
    return alert("Enter valid rate.");

  const existing=
    purchaseLines.find(l=>l.itemId===x.id);

  if(existing){

    existing.qty+=qty;
    existing.rate=rate

  }else{

    purchaseLines.push({
      itemId:x.id,
      name:x.name,
      hsn:x.hsn||"",
      qty,
      unit:x.unit||"Nos",
      rate
    })
  }

  document.getElementById("purchaseItemSearch").value="";
  document.getElementById("purchaseHSN").value="";
  document.getElementById("purchaseUnit").value="";
  document.getElementById("purchaseRate").value="";
  document.getElementById("purchaseQty").value=1;

  document.getElementById("selectedPurchaseItem").textContent=
    "No item selected";

  selectedPurchaseId=null;

  updatePurchaseTotals()
}

function renderPurchaseLines(){

  const body=document.getElementById("purchaseLinesBody");

  if(!body)return;

  if(!purchaseLines.length){

    body.innerHTML=
      '<tr><td colspan="8" class="empty">No purchase items added.</td></tr>';

    return
  }

  body.innerHTML=purchaseLines.map((l,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${esc(l.name||"-")}</td>
      <td>${esc(l.hsn||"-")}</td>
      <td>${Number(l.qty)||0}</td>
      <td>${esc(l.unit||"Nos")}</td>
      <td>${money(l.rate)}</td>
      <td>${money((Number(l.qty)||0)*(Number(l.rate)||0))}</td>
      <td>
        <button type="button"
          class="action-btn"
          onclick="removePurchaseLine(${i})">
          Remove
        </button>
      </td>
    </tr>
  `).join("")
}

function removePurchaseLine(i){
  purchaseLines.splice(i,1);
  updatePurchaseTotals()
}

function updatePurchaseTotals(){

  const sub=
    purchaseLines.reduce(
      (s,l)=>s+l.qty*l.rate,
      0
    );

  const cg=sub*.09;
  const sg=sub*.09;

  const a=document.getElementById("purchaseSubtotal");
  const b=document.getElementById("purchaseCGST");
  const c=document.getElementById("purchaseSGST");
  const d=document.getElementById("purchaseGrandTotal");

  if(a)a.textContent=money(sub);
  if(b)b.textContent=money(cg);
  if(c)c.textContent=money(sg);
  if(d)d.textContent=money(sub+cg+sg)
}

function fillPurchaseVendorDetails(){

  const select=document.getElementById("vendorName");

  const x=suppliers.find(
    s=>s.name===select.value
  );

  document.getElementById("vendorMobile").value=
    x?.mobile||"-";

  document.getElementById("vendorGSTIN").value=
    x?.gstin||"-";

  document.getElementById("vendorAddress").value=
    x?.address||"-"
}

function populateSupplierSelect(){

  const s=document.getElementById("vendorName");

  if(!s)return;

  const cur=s.value;

  s.innerHTML=
    '<option value="">Select Supplier</option>'+
    suppliers.map(x=>
      `<option value="${esc(x.name)}">
        ${esc(x.name)}
      </option>`
    ).join("");

  if(suppliers.some(x=>x.name===cur))
    s.value=cur;

  fillPurchaseVendorDetails()
}

let purchaseBillPreviewUrl="";

function showPurchaseBillName(){

  const input=document.getElementById("purchaseBillFile");
  const box=document.getElementById("purchaseBillName");
  const btn=document.getElementById("viewBillPreviewBtn");
  const f=input.files?.[0];

  if(!f){

    box.textContent="No bill selected";

    if(btn)btn.hidden=true;

    return
  }

  if(f.size>10*1024*1024){

    alert("Purchase bill must be 10 MB or smaller.");

    input.value="";
    box.textContent="No bill selected";

    if(btn)btn.hidden=true;

    setOcrStatus(
      "idle",
      "Upload a bill to start automatic extraction.",
      0
    );

    return
  }

  if(![
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ].includes(f.type)){

    alert("Allowed: PDF, JPG, JPEG, PNG, WEBP.");

    input.value="";
    box.textContent="No bill selected";

    if(btn)btn.hidden=true;

    setOcrStatus(
      "idle",
      "Upload a supported bill file.",
      0
    );

    return
  }

  box.textContent="Selected: "+f.name;

  if(btn)btn.hidden=false
}

function setOcrStatus(type,text,pct){

  const s=document.getElementById("billOcrStatus");
  const bar=document.getElementById("billOcrProgress");

  if(!s)return;

  s.className="ocr-status "+type;
  s.textContent=text;

  if(bar){

    const span=bar.querySelector("span");

    if(span)
      span.style.width=
        Math.max(
          0,
          Math.min(100,pct||0)
        )+"%"
  }
}

function normText(s){
  return String(s||"")
    .replace(/\s+/g," ")
    .trim()
}

function normKey(s){
  return normText(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"")
}

function firstMatch(text,patterns){

  for(const re of patterns){

    const m=text.match(re);

    if(m&&m[1])
      return normText(m[1])
  }

  return ""
}

function toIsoDate(v){

  if(!v)return "";

  const m=String(v).match(
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/
  );

  if(!m)return "";

  let a=Number(m[1]);
  let b=Number(m[2]);
  let y=Number(m[3]);

  if(y<100)y+=2000;

  let day=a;
  let month=b;

  if(a>12&&b<=12){
    day=a;
    month=b
  }else if(b>12&&a<=12){
    day=b;
    month=a
  }

  if(
    month<1||
    month>12||
    day<1||
    day>31
  )return "";

  return `${y}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
}

function cleanOcrLine(s){

  return normText(s)
    .replace(/[|{}\[\]]/g," ")
    .replace(/\s+/g," ")
    .trim()
}

function normalizeOcrToken(s){

  return String(s||"")
    .replace(/[|]/g,"I")
    .replace(/[“”‘’]/g,'"')
    .trim()
}

function parseOcrBill(text){

  const lines=String(text||"")
    .split(/\r?\n/)
    .map(cleanOcrLine)
    .filter(Boolean);

  const flat=lines.join(" ");

  const gst=
    (
      flat.match(
        /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/i
      )||[]
    )[1]||"";

  const mobile=
    (
      flat.match(
        /(?:mobile|mob|phone|contact|ph)\D{0,20}(?:\+?91[\s-]?)?([6-9]\d{9})\b/i
      )||[]
    )[1]||
    (
      flat.match(/\b([6-9]\d{9})\b/)||[]
    )[1]||"";

  const directInv=
    (
      flat.match(
        /\b([A-Z]{2,}[A-Z0-9._-]*\/\d{1,8}\/20\d{2}-\d{2})\b/i
      )||[]
    )[1]||"";

  let inv=directInv;

  for(let i=0;i<lines.length;i++){

    const line=lines[i];

    const m=
      line.match(
        /\b(?:tax\s*)?invoice\s*(?:no\.?|number|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\/_\.\-]{2,})\b/i
      )||
      line.match(
        /\bbill\s*(?:no\.?|number|#)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\/_\.\-]{2,})\b/i
      );

    if(
      m&&
      !/^(date|dated|gst|gstin|name|number|no|invoice|bill)$/i
        .test(m[1])
    ){

      inv=normalizeOcrToken(m[1]);

      break
    }

    if(
      /\b(?:tax\s*)?invoice\s*(?:no\.?|number|#)\s*[:\-]?\s*$/i.test(line)||
      /\bbill\s*(?:no\.?|number|#)\s*[:\-]?\s*$/i.test(line)
    ){

      const next=cleanOcrLine(lines[i+1]||"");

      const n=
        next.match(
          /[A-Z]{1,}[A-Z0-9\/_\.\-]{2,}/i
        );

      if(
        n&&
        !/^(date|dated|gst|gstin|invoice|bill|total|amount)$/i
          .test(n[0])
      ){

        inv=normalizeOcrToken(n[0]);

        break
      }
    }
  }

  let vendor="";

  const reject=
    /^(tax\s*invoice|invoice|bill|original|duplicate|copy|purchase|date|dated|gst|gstin|phone|mobile|contact|address|quotation|cash|credit|page|item|description|qty|quantity|rate|amount|total|subtotal|cgst|sgst|igst|hsn|tax|discount|round|grand)$/i;

  for(const line of lines.slice(0,18)){

    const v=
      cleanOcrLine(line)
      .replace(
        /\s+(?:tax\s+invoice|invoice\s*no\.?\s*dated|invoice|bill|original|duplicate|copy)(?:\s+(?:dated))?\s*$/i,
        ""
      )
      .trim();

    if(
      v.length>=3&&
      v.length<=100&&
      /[A-Za-z]{3,}/.test(v)&&
      !reject.test(v)&&
      !/^[0-9]/.test(v)
    ){

      vendor=v;
      break
    }
  }

  let address="";

  const vendorIndex=
    vendor
    ?lines.findIndex(
      l=>
        normKey(l)===normKey(vendor)||
        normKey(l).includes(normKey(vendor))||
        normKey(vendor).includes(normKey(l))
    )
    :-1;

  if(vendorIndex>=0){

    const a=[];

    for(
      let i=vendorIndex+1;
      i<Math.min(lines.length,vendorIndex+8);
      i++
    ){

      const line=lines[i];

      if(
        /^(recipient\s*id|gstin(?:\/uin)?|state\s*name|e[-\s]?mail|email|phone|mobile|invoice\s*no|invoice\s*number|dated|delivery\s*note|reference\s*no|buyer|dispatch|terms\s*of\s*delivery|sl\.?\s*no)/i
          .test(line)
      )break;

      if(
        /\b(?:gstin|gstin\/uin)\b/i.test(line)||
        /@/.test(line)
      )break;

      if(
        line&&
        /[A-Za-z]/.test(line)
      )
        a.push(line)
    }

    address=a.join(", ").trim();

    if(inv)
      address=address.replace(
        new RegExp(
          inv.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          "ig"
        ),
        ""
      );

    address=address
      .replace(
        /\b\d{1,2}[-\/]?[A-Za-z]{3}[-\/]?\d{2,4}\b/g,
        ""
      )
      .replace(
        /\bDelivery\s+Note.*$/i,
        ""
      )
      .replace(
        /\bMode\/Terms\s+of\s+Payment.*$/i,
        ""
      )
      .replace(/\s{2,}/g," ")
      .replace(/\s*,\s*,/g,",")
      .replace(/^[,\s]+|[,\s]+$/g,"")
      .trim()
  }

  const itemRows=[];

  let current=null;

  const stop=
    /^(sl\.?\s*no|amount\s*chargeable|tax\s*amount|tax\s*amount\s*\(in\s*words\)|total|output\s*(?:cgst|sgst|igst)|company.?s\s+bank|bank\s+name|a\/c\s+no|branch|declaration|terms|authori[sz]ed|this\s+is\s+a\s+computer)/i;

  for(const raw of lines){

    const l=
      cleanOcrLine(raw)
      .replace(/\b(?:₹|rs\.?|inr)\b/ig," ")
      .replace(/\s+/g," ")
      .trim();

    if(!l)continue;

    if(stop.test(l)){
      current=null;
      continue
    }

    const m=
      l.match(
        /^(\d+)\s+(.+?)\s+(\d{4,8})\s+(\d+(?:\.\d+)?)\s*%\s+(\d+(?:\.\d+)?)\s+([A-Za-z]+)\s+([\d,]+(?:\.\d+)?)\s+[A-Za-z]+\s+([\d,]+(?:\.\d+)?)(?:\s*)$/
      );

    if(m){

      const name=m[2].trim();
      const hsn=m[3];
      const qty=Number(m[5]);
      const rate=
        Number(
          m[7].replace(/,/g,"")
        );

      const amount=
        Number(
          m[8].replace(/,/g,"")
        );

      if(name&&qty>0&&rate>=0){

        current={
          name,
          hsn,
          qty,
          rate,
          amount,
          unit:m[6]||"Nos"
        };

        itemRows.push(current)
      }

      continue
    }

    const starts=l.match(/^(\d+)\s+(.+)/);

    if(
      starts&&
      /\b\d{4,8}\b/.test(l)
    ){

      const h=l.match(/\b(\d{4,8})\b/);

      const nums=[
        ...l.matchAll(
          /\b([\d,]+(?:\.\d+)?)\b/g
        )
      ].map(x=>x[1]);

      if(h&&nums.length>=3){

        const hsn=h[1];

        const qty=
          Number(
            nums[nums.length-3]
              .replace(/,/g,"")
          );

        const rate=
          Number(
            nums[nums.length-2]
              .replace(/,/g,"")
          );

        const amount=
          Number(
            nums[nums.length-1]
              .replace(/,/g,"")
          );

        let name=
          l.slice(
            0,
            l.indexOf(hsn)
          )
          .replace(/^\d+\s*/,"")
          .trim();

        if(name&&qty>0&&rate>=0){

          current={
            name,
            hsn,
            qty,
            rate,
            amount,
            unit:"Nos"
          };

          itemRows.push(current)
        }

        continue
      }
    }

    if(
      current&&
      /^[A-Za-z][A-Za-z0-9\s\/()._-]{2,80}$/.test(l)&&
      !/^\d/.test(l)&&
      !/\b(?:gst|tax|total|amount|rate|qty|quantity|bank|terms|declaration|warranty|invoice)\b/i.test(l)
    ){

      current.name=
        (current.name+" "+l)
        .replace(/\s+/g," ")
        .trim()
    }
  }

  const unique=[];
  const seen=new Set();

  for(const row of itemRows){

    const key=
      normKey(row.name)+
      "|"+
      row.qty+
      "|"+
      row.rate;

    if(!seen.has(key)){

      seen.add(key);
      unique.push(row)
    }
  }

  return {
    vendorName:vendor,
    invoiceNo:inv,
    gstin:gst.toUpperCase(),
    mobile,
    address,
    items:unique,
    raw:String(text||"")
  }
}

async function imageToText(source){

  if(!window.Tesseract)
    throw new Error(
      "OCR engine is not loaded. Keep Internet ON and reload the page once."
    );

  const result=
    await Tesseract.recognize(
      source,
      "eng",
      {
        workerPath:
          "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",

        corePath:
          "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js",

        langPath:
          "https://tessdata.projectnaptha.com/4.0.0",

        config:{
          tessedit_pageseg_mode:"6"
        },

        logger:m=>{

          if(
            m.status==="recognizing text"
          ){

            setOcrStatus(
              "working",
              `Reading bill… ${Math.round((m.progress||0)*100)}%`,
              Math.round((m.progress||0)*100)
            )
          }
        }
      }
    );

  return result.data.text||""
}

function getPdfJs(){

  if(!window.pdfjsLib)
    throw new Error(
      "PDF reader is not loaded. Keep Internet ON and reload the page once."
    );

  if(window.pdfjsLib.GlobalWorkerOptions){

    window.pdfjsLib.GlobalWorkerOptions.workerSrc=
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
  }

  return window.pdfjsLib
}

async function pdfToText(file){

  const pdfjs=await getPdfJs();

  const data=
    new Uint8Array(
      await file.arrayBuffer()
    );

  const pdf=
    await pdfjs.getDocument({data}).promise;

  const pages=
    Math.min(pdf.numPages,10);

  let textOut="";

  for(let p=1;p<=pages;p++){

    setOcrStatus(
      "working",
      `Reading PDF page ${p} of ${pages}…`,
      Math.round((p-1)/pages*100)
    );

    const page=
      await pdf.getPage(p);

    const content=
      await page.getTextContent();

    const rows=[];

    for(const it of content.items){

      const txt=
        String(it.str||"").trim();

      if(!txt)continue;

      const y=
        Array.isArray(it.transform)
        ?Number(it.transform[5]||0)
        :0;

      let row=
        rows.find(
          r=>Math.abs(r.y-y)<3.5
        );

      if(!row){

        row={
          y,
          parts:[]
        };

        rows.push(row)
      }

      row.parts.push({
        x:
          Array.isArray(it.transform)
          ?Number(it.transform[4]||0)
          :0,
        text:txt
      })
    }

    rows.sort((a,b)=>b.y-a.y);

    const pageText=
      rows
      .map(r=>
        r.parts
        .sort((a,b)=>a.x-b.x)
        .map(v=>v.text)
        .join(" ")
        .replace(/\s+/g," ")
        .trim()
      )
      .filter(Boolean)
      .join("\n");

    if(pageText)
      textOut+=`\n${pageText}`;

    setOcrStatus(
      "working",
      `Reading PDF page ${p} of ${pages}…`,
      Math.round(p/pages*100)
    )
  }

  if(normText(textOut).length>=30)
    return textOut;

  textOut="";

  for(let p=1;p<=pages;p++){

    setOcrStatus(
      "working",
      `OCR scanning PDF page ${p} of ${pages}…`,
      Math.round((p-1)/pages*100)
    );

    const page=
      await pdf.getPage(p);

    const viewport=
      page.getViewport({
        scale:2.2
      });

    const canvas=
      document.createElement("canvas");

    canvas.width=
      Math.ceil(viewport.width);

    canvas.height=
      Math.ceil(viewport.height);

    const ctx=
      canvas.getContext(
        "2d",
        {willReadFrequently:true}
      );

    await page.render({
      canvasContext:ctx,
      viewport
    }).promise;

    textOut+=
      `\n${await imageToText(canvas)}`;

    setOcrStatus(
      "working",
      `OCR scanning PDF page ${p} of ${pages}…`,
      Math.round(p/pages*100)
    )
  }

  return textOut
}


/* =========================================================
   OCR -> PURCHASE
   ========================================================= */

function applyOcrToPurchase(data){

  const byId=id=>document.getElementById(id);

  byId("ocrResultCard").hidden=false;

  byId("ocrVendorName").value=
    data.vendorName||"-";

  byId("ocrVendorInvoice").value=
    data.invoiceNo||"-";

  byId("ocrGSTIN").value=
    data.gstin||"-";

  byId("ocrMobile").value=
    data.mobile||"-";

  byId("ocrAddress").value=
    data.address||"-";


  if(data.invoiceNo)
    byId("purchaseBillNo").value=
      data.invoiceNo;

  if(data.gstin)
    byId("vendorGSTIN").value=
      data.gstin;

  if(data.mobile)
    byId("vendorMobile").value=
      data.mobile;

  if(data.address)
    byId("vendorAddress").value=
      data.address;


  /* Vendor */

  if(data.vendorName){

    const sel=
      byId("vendorName");

    let match=
      [...sel.options].find(
        o=>
          normKey(o.value)===normKey(data.vendorName)||
          normKey(o.textContent)===normKey(data.vendorName)
      );

    if(!match){

      const opt=
        document.createElement("option");

      opt.value=data.vendorName;
      opt.textContent=data.vendorName;

      sel.appendChild(opt);

      match=opt
    }

    sel.value=match.value;

    const supplier=
      suppliers.find(
        v=>
          normKey(v.name)===
          normKey(data.vendorName)
      );

    if(supplier)
      fillPurchaseVendorDetails();

    if(data.mobile)
      byId("vendorMobile").value=
        data.mobile;

    if(data.gstin)
      byId("vendorGSTIN").value=
        data.gstin;

    if(data.address)
      byId("vendorAddress").value=
        data.address
  }


  /* =======================================================
     IMPORTANT:
     Keep OCR rows separately.
     This is what makes mapping stable.
     ======================================================= */

  const mappingItems=
    syncMappingItems();

  purchaseLines=[];

  ocrItems=
    (data.items||[]).map(
      (row,i)=>({
        ...row,
        mapRowId:
          "ocr_"+Date.now()+"_"+i
      })
    );


  let matched=0;
  let unmatched=[];


  for(const row of ocrItems){

    const nk=
      normKey(row.name);


    /* 1. Exact item name */

    let x=
      mappingItems.find(
        i=>
          normKey(
            i.name||
            i.itemName||
            ""
          )===nk
      );


    /* 2. HSN exact match only if unique */

    if(!x&&row.hsn){

      const sameHsn=
        mappingItems.filter(
          i=>
            String(i.hsn||"").trim()===
            String(row.hsn||"").trim()
        );

      if(sameHsn.length===1)
        x=sameHsn[0]
    }


    /* 3. Partial item name */

    if(!x&&nk){

      x=
        mappingItems.find(i=>{

          const k=
            normKey(
              i.name||
              i.itemName||
              ""
            );

          return(
            k&&
            (
              k.includes(nk)||
              nk.includes(k)
            )
          )
        })
    }


    purchaseLines.push({

      mapRowId:row.mapRowId,

      itemId:
        x?x.id:null,

      name:
        x
        ?(x.name||x.itemName)
        :row.name,

      hsn:
        row.hsn||
        x?.hsn||
        "",

      qty:
        Number(row.qty)||1,

      unit:
        row.unit||
        x?.unit||
        "Nos",

      rate:
        Number(row.rate)||
        Number(x?.purchaseRate)||
        0,

      ocrUnmatched:!x
    });


    if(x)
      matched++;
    else
      unmatched.push(row.name)
  }


  /* IMPORTANT:
     Render ONLY OCR mapping table */
  renderOcrMappingTable();

  updatePurchaseTotals();


  const note=
    byId("ocrNote");

  if(note){

    note.textContent=
      ocrItems.length

      ?`OCR found ${ocrItems.length} item row(s). ${matched} matched Item Master automatically.${unmatched.length?` ${unmatched.length} item(s) need Item Master mapping before saving.`:" All items matched."}`

      :"Bill text was extracted, but no reliable item rows were detected."
  }
}


/* =========================================================
   ITEM MASTER RECOVERY
   ========================================================= */

function getMappingItems(){

  const merged=[];
  const seen=new Set();


  function addList(list){

    if(!Array.isArray(list))
      return;


    for(const raw of list){

      if(!raw||raw.id==null)
        continue;


      const name=
        String(
          raw.name||
          raw.itemName||
          raw.description||
          ""
        ).trim();


      if(!name)
        continue;


      if(
        raw.hsn==null&&
        raw.purchaseRate==null&&
        raw.saleRate==null
      )
        continue;


      const x={
        ...raw,
        name
      };


      const id=
        String(x.id);


      if(!seen.has(id)){

        seen.add(id);
        merged.push(x)
      }
    }
  }


  /* Current Item Master */

  addList(items);


  /* Recover old Item Master storage */

  for(let i=0;i<localStorage.length;i++){

    const key=
      localStorage.key(i);

    try{

      const val=
        JSON.parse(
          localStorage.getItem(key)
        );


      if(Array.isArray(val)){

        addList(val)

      }else if(
        val&&
        Array.isArray(val.items)
      ){

        addList(val.items)
      }

    }catch(e){}
  }


  return merged
}

function syncMappingItems(){

  const master=
    getMappingItems();


  /* Do NOT erase existing items if
     another storage key is unavailable */

  if(master.length){

    items=master;

    save(
      ITEMS_KEY,
      items
    )
  }

  return master
}


/* =========================================================
   OCR MAPPING TABLE
   ========================================================= */

function renderOcrMappingTable(){

  const body=
    document.getElementById(
      "ocrItemsBody"
    );

  if(!body)return;


  const mappingItems=
    getMappingItems();


  if(!ocrItems.length){

    body.innerHTML=
      '<tr><td colspan="8" class="empty">No reliable item rows detected.</td></tr>';

    return
  }


  body.innerHTML=
    ocrItems.map((src,i)=>{

      const row=
        purchaseLines[i]||
        src;


      const selectedId=
        String(row.itemId||"");


      const opts=
        mappingItems.map(it=>{

          const id=
            String(it.id);


          const label=[
            it.name||
            it.itemName,

            it.code,

            it.hsn
              ?`HSN ${it.hsn}`
              :""

          ]
          .filter(Boolean)
          .join(" • ");


          return `
            <option
              value="${esc(id)}"
              ${id===selectedId?"selected":""}>
              ${esc(label)}
            </option>
          `
        }).join("");


      return `
        <tr>

          <td>${i+1}</td>

          <td>
            ${esc(
              src.name||
              row.name||
              "-"
            )}
          </td>

          <td>
            ${esc(
              src.hsn||
              row.hsn||
              "-"
            )}
          </td>

          <td>
            ${Number(
              src.qty||
              row.qty
            )||1}
          </td>

          <td>
            ${esc(
              src.unit||
              row.unit||
              "Nos"
            )}
          </td>

          <td>
            ${money(
              src.rate||
              row.rate
            )}
          </td>

          <td>
            ${money(
              (
                Number(
                  src.qty||
                  row.qty
                )||0
              )*
              (
                Number(
                  src.rate||
                  row.rate
                )||0
              )
            )}
          </td>

          <td>

            <select
              class="ocr-item-map"
              data-map-index="${i}"
              onchange="mapOcrItem(this)">

              <option value="">
                ${
                  mappingItems.length
                  ?"Select Item Master"
                  :"No Item Master found"
                }
              </option>

              ${opts}

            </select>

          </td>

        </tr>
      `
    }).join("")
}


/* =========================================================
   ACTUAL MAPPING FUNCTION
   ========================================================= */

function mapOcrItem(select){

  if(!select)return;


  const index=
    Number(
      select.dataset.mapIndex
    );


  if(
    !Number.isInteger(index)||
    !purchaseLines[index]
  )
    return;


  const itemId=
    String(
      select.value||""
    );


  const mappingItems=
    getMappingItems();


  const x=
    mappingItems.find(
      it=>
        String(it.id)===
        itemId
    );


  const row=
    purchaseLines[index];


  if(!x){

    row.itemId=null;
    row.ocrUnmatched=true;

  }else{

    row.itemId=x.id;

    row.name=
      x.name||
      x.itemName||
      row.name;

    row.hsn=
      x.hsn||
      row.hsn||
      "";

    row.unit=
      x.unit||
      row.unit||
      "Nos";


    if(!Number(row.rate)){

      row.rate=
        Number(
          x.purchaseRate
        )||0
    }


    row.ocrUnmatched=false
  }


  /* Re-render mapping table so
     selected Item Master remains visible */

  renderOcrMappingTable();

  updatePurchaseTotals();


  const unmatched=
    purchaseLines.filter(
      l=>!l.itemId
    ).length;


  const note=
    document.getElementById(
      "ocrNote"
    );


  if(note){

    note.textContent=
      unmatched

      ?`${purchaseLines.length} item row(s) detected. ${unmatched} item(s) still need Item Master mapping before saving.`

      :`${purchaseLines.length} item row(s) detected. All items are mapped to Item Master and ready to save.`
  }
}


/* =========================================================
   BILL PREVIEW
   ========================================================= */

function viewUploadedBillPreview(){

  const file=
    document.getElementById(
      "purchaseBillFile"
    )?.files?.[0];


  if(!file)
    return alert(
      "Choose a vendor bill first."
    );


  const box=
    document.getElementById(
      "billPreviewContent"
    );

  const modal=
    document.getElementById(
      "billPreviewModal"
    );


  if(!box||!modal)return;


  const url=
    URL.createObjectURL(file);


  box.innerHTML="";


  if(
    file.type===
    "application/pdf"
  ){

    const iframe=
      document.createElement(
        "iframe"
      );

    iframe.src=url;

    iframe.style.cssText=
      "width:100%;height:100%;border:0;min-height:75vh";

    box.appendChild(iframe)

  }else{

    const img=
      document.createElement(
        "img"
      );

    img.src=url;

    img.alt="Vendor Bill";

    img.style.cssText=
      "display:block;max-width:100%;height:auto;margin:auto";

    box.appendChild(img)
  }


  modal.hidden=false;

  modal.classList.add("show");

  modal.dataset.previewUrl=url
}

function closeBillPreview(){

  const modal=
    document.getElementById(
      "billPreviewModal"
    );

  if(!modal)return;


  const url=
    modal.dataset.previewUrl;


  if(url)
    URL.revokeObjectURL(url);


  modal.dataset.previewUrl="";

  modal.hidden=true;


  const box=
    document.getElementById(
      "billPreviewContent"
    );

  if(box)
    box.innerHTML="";


  modal.classList.remove("show")
}


/* =========================================================
   OCR START
   ========================================================= */

async function autoExtractPurchaseBill(){

  const file=
    document.getElementById(
      "purchaseBillFile"
    )?.files?.[0];


  if(!file)return;


  if(
    file.size>
    10*1024*1024
  ){

    setOcrStatus(
      "error",
      "Bill file is larger than 10 MB.",
      0
    );

    return
  }


  const allowed=[
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];


  if(!allowed.includes(file.type)){

    setOcrStatus(
      "error",
      "Allowed formats: PDF, JPG, JPEG, PNG, WEBP.",
      0
    );

    return
  }


  document.getElementById(
    "ocrResultCard"
  ).hidden=false;


  setOcrStatus(
    "working",
    "Starting automatic bill extraction…",
    2
  );


  try{

    let text=
      file.type===
      "application/pdf"

      ?await pdfToText(file)

      :await imageToText(file);


    if(!normText(text))
      throw new Error(
        "No readable text found. Try a clearer PDF/photo with the bill text visible."
      );


    const data=
      parseOcrBill(text);


    applyOcrToPurchase(data);


    setOcrStatus(
      "done",
      "Bill extracted successfully. Review the extracted fields and items before saving.",
      100
    );

  }catch(e){

    console.error(
      "Purchase bill OCR error:",
      e
    );


    setOcrStatus(
      "error",
      e.message||
      "Bill OCR failed. Enter details manually.",
      0
    );


    const note=
      document.getElementById(
        "ocrNote"
      );

    if(note)
      note.textContent=
        "Automatic extraction failed. You can still enter the purchase details manually."
  }
}


/* =========================================================
   INDEXED DB BILL STORAGE
   ========================================================= */

function openBillDB(){

  return new Promise(
    (res,rej)=>{

      const r=
        indexedDB.open(
          "SUVI_INFOTECH_FRESH_BILLS",
          1
        );


      r.onupgradeneeded=()=>{

        if(
          !r.result.objectStoreNames
            .contains("bills")
        ){

          r.result.createObjectStore(
            "bills"
          )
        }
      };


      r.onsuccess=()=>
        res(r.result);

      r.onerror=()=>
        rej(r.error)
    }
  )
}

async function saveBill(key,file){

  if(!file)return;


  const db=
    await openBillDB();


  return new Promise(
    (res,rej)=>{

      const tx=
        db.transaction(
          "bills",
          "readwrite"
        );


      tx.objectStore("bills")
        .put(
          {
            name:file.name,
            type:file.type,
            size:file.size,
            blob:file
          },
          key
        );


      tx.oncomplete=()=>{
        db.close();
        res()
      };


      tx.onerror=()=>{
        db.close();
        rej(tx.error)
      }
    }
  )
}

async function openPurchaseBill(key){

  try{

    const db=
      await openBillDB();


    const req=
      db.transaction(
        "bills",
        "readonly"
      )
      .objectStore("bills")
      .get(key);


    req.onsuccess=()=>{

      const rec=req.result;

      db.close();


      if(!rec)
        return alert(
          "Bill file not found."
        );


      const box=
        document.getElementById(
          "billPreviewContent"
        );

      const modal=
        document.getElementById(
          "billPreviewModal"
        );


      if(!box||!modal)
        return alert(
          "Bill preview window is unavailable."
        );


      if(purchaseBillPreviewUrl)
        URL.revokeObjectURL(
          purchaseBillPreviewUrl
        );


      purchaseBillPreviewUrl=
        URL.createObjectURL(
          rec.blob
        );


      box.innerHTML="";


      if(
        rec.type===
        "application/pdf"
      ){

        const iframe=
          document.createElement(
            "iframe"
          );

        iframe.src=
          purchaseBillPreviewUrl;

        iframe.style.cssText=
          "width:100%;height:100%;border:0;min-height:75vh";

        box.appendChild(iframe)

      }else{

        const img=
          document.createElement(
            "img"
          );

        img.src=
          purchaseBillPreviewUrl;

        img.alt=
          rec.name||
          "Vendor Bill";

        img.style.cssText=
          "display:block;max-width:100%;height:auto;margin:auto";

        box.appendChild(img)
      }


      modal.hidden=false;

      modal.classList.add("show");

      modal.dataset.previewUrl=
        purchaseBillPreviewUrl
    };


    req.onerror=()=>{

      db.close();

      alert(
        "Unable to open bill."
      )
    }

  }catch(e){

    alert(
      "Bill storage unavailable in this browser/WebView."
    )
  }
}


/* =========================================================
   SAVE PURCHASE
   ========================================================= */

async function savePurchase(e){

  e.preventDefault();


  syncMappingItems();


  if(!purchaseLines.length)
    return alert(
      "Add at least one purchase item."
    );


  if(
    purchaseLines.some(
      l=>!l.itemId
    )
  ){

    return alert(
      "OCR items are visible below, but one or more items are not mapped to Item Master. Select each matching Item Master item before saving."
    )
  }


  const vendor=
    document.getElementById(
      "vendorName"
    ).value;


  if(!vendor)
    return alert(
      "Select supplier."
    );


  const vendorInvoiceNo=
    document.getElementById(
      "purchaseBillNo"
    ).value.trim();


  if(!vendorInvoiceNo)
    return alert(
      "Enter vendor invoice number."
    );


  const file=
    document.getElementById(
      "purchaseBillFile"
    ).files?.[0]||null;


  if(
    file&&
    file.size>
    10*1024*1024
  )
    return alert(
      "Purchase bill must be 10 MB or smaller."
    );


  const no=vendorInvoiceNo;


  const date=
    document.getElementById(
      "purchaseDate"
    ).value||
    today();


  const sub=
    purchaseLines.reduce(
      (s,l)=>s+l.qty*l.rate,
      0
    );


  const cg=sub*.09;
  const sg=sub*.09;
  const total=sub+cg+sg;


  for(const l of purchaseLines){

    if(
      !items.find(
        x=>x.id===l.itemId
      )
    ){

      return alert(
        "Item not found: "+l.name
      )
    }
  }


  if(file){

    try{

      await saveBill(
        no,
        file
      )

    }catch(err){

      return alert(
        "Bill could not be stored. Purchase not saved."
      )
    }
  }


  purchaseLines.forEach(l=>{

    const x=
      items.find(
        i=>i.id===l.itemId
      );


    x.stock=
      Number(x.stock||0)+
      l.qty;


    x.purchaseRate=
      l.rate;


    movements.unshift({

      date,

      type:"IN",

      reference:no,

      itemId:x.id,

      item:x.name,

      qty:l.qty,

      rate:l.rate,

      total:l.qty*l.rate,

      party:vendor
    })
  });


  purchases.unshift({

    date,

    vendorInvoiceNo,

    billNo:vendorInvoiceNo,

    vendor:cap(vendor),

    vendorMobile:
      document.getElementById(
        "vendorMobile"
      ).value.trim()||"-",

    vendorGSTIN:
      document.getElementById(
        "vendorGSTIN"
      ).value.trim()||"-",

    vendorAddress:
      document.getElementById(
        "vendorAddress"
      ).value.trim()||"-",

    billFileName:
      file?.name||"",

    lines:
      JSON.parse(
        JSON.stringify(
          purchaseLines
        )
      ),

    subtotal:sub,

    cgst:cg,

    sgst:sg,

    grandTotal:total
  });


  save(
    ITEMS_KEY,
    items
  );

  save(
    PURCHASE_KEY,
    purchases
  );

  save(
    MOVE_KEY,
    movements
  );


  document.getElementById(
    "purchaseForm"
  ).reset();


  document.getElementById(
    "purchaseDate"
  ).value=today();


  document.getElementById(
    "purchaseBillName"
  ).textContent=
    "No bill selected";


  const previewBtn=
    document.getElementById(
      "viewBillPreviewBtn"
    );

  if(previewBtn)
    previewBtn.hidden=true;


  document.getElementById(
    "purchaseBillFile"
  ).value="";


  purchaseLines=[];

  ocrItems=[];

  selectedPurchaseId=null;

  renderAll();


  alert(
    "Purchase saved. Stock IN updated."
  )
}


/* =========================================================
   PURCHASE HISTORY
   ========================================================= */

function renderPurchaseHistory(){

  const q=
    (
      document.getElementById(
        "purchaseHistorySearch"
      )?.value||""
    ).toLowerCase();


  const body=
    document.getElementById(
      "purchaseHistoryBody"
    );

  if(!body)return;


  body.innerHTML=
    purchases
    .filter(x=>
      [
        x.vendor,
        x.vendorInvoiceNo,
        x.billNo,
        x.purchaseInvoiceNo,
        x.billFileName,
        ...(x.lines||[]).map(
          l=>l.name
        )
      ]
      .join(" ")
      .toLowerCase()
      .includes(q)
    )
    .map(x=>{

      const no=
        x.vendorInvoiceNo||
        x.billNo;


      return `
        <tr>

          <td>${esc(x.date)}</td>

          <td>${esc(no||"-")}</td>

          <td>${esc(x.vendor)}</td>

          <td>${esc(x.vendorMobile||"-")}</td>

          <td>${esc(x.vendorGSTIN||"-")}</td>

          <td>${money(x.grandTotal)}</td>

          <td>
            <button
              class="action-btn"
              onclick='viewPurchaseInvoice(${JSON.stringify(no)})'>
              View
            </button>
          </td>

          <td>
            ${
              x.billFileName
              ?`
                <button
                  class="action-btn"
                  onclick='openPurchaseBill(${JSON.stringify(no)})'>
                  Bill
                </button>
              `
              :"-"
            }
          </td>

        </tr>
      `
    })
    .join("")||
    `<tr><td colspan="8" class="empty">No purchase records.</td></tr>`
}


/* =========================================================
   PURCHASE VIEW
   ========================================================= */

function purchasePrintHtml(r){

  const rows=
    (r.lines||[])
    .map((l,i)=>`

      <tr>

        <td>${i+1}</td>

        <td>${esc(l.name)}</td>

        <td>${esc(l.hsn||"-")}</td>

        <td>${l.qty}</td>

        <td>${esc(l.unit)}</td>

        <td>${money(l.rate)}</td>

        <td>${money(l.qty*l.rate)}</td>

      </tr>

    `)
    .join("");


  return `
<!doctype html>

<html>

<head>

<title>
${esc(r.vendorInvoiceNo||r.billNo||"Purchase")}
</title>

<style>

body{
  font-family:Arial;
  margin:25px;
  color:#172033
}

h1{
  margin:0;
  color:#07529a
}

.head{
  display:flex;
  justify-content:space-between
}

.box{
  border:1px solid #bbb;
  padding:12px;
  margin:15px 0
}

table{
  width:100%;
  border-collapse:collapse
}

th,td{
  border:1px solid #bbb;
  padding:8px
}

th{
  background:#eef5fc
}

.total{
  margin-left:auto;
  width:330px
}

.sign{
  margin:60px 0 0 auto;
  width:220px;
  text-align:center;
  border-top:1px solid #333;
  padding-top:7px
}

@media print{
  button{
    display:none
  }
}

</style>

</head>

<body>

<button onclick="print()">
Print / Save PDF
</button>


<div class="head">

<div>

<h1>SUVI INFOTECH</h1>

<b>Purchase Invoice</b>

</div>

<div>

Vendor Invoice No:
<b>
${esc(
  r.vendorInvoiceNo||
  r.billNo||
  "-"
)}
</b>

<br>

Date:
${esc(r.date)}

</div>

</div>


<div class="box">

<b>Vendor</b>

<br>

${esc(r.vendor)}

<br>

Mobile:
${esc(r.vendorMobile||"-")}

<br>

GST:
${esc(r.vendorGSTIN||"-")}

<br>

Address:
${esc(r.vendorAddress||"-")}

<br>

Vendor Invoice No:
<b>
${esc(
  r.vendorInvoiceNo||
  r.billNo||
  "-"
)}
</b>

</div>


<table>

<thead>

<tr>

<th>SL.No.</th>

<th>Item Description</th>

<th>HSN Code</th>

<th>Qty</th>

<th>Unit</th>

<th>Amount</th>

<th>Total Amount</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>


<div class="total">

<p>
Subtotal:
<b>${money(r.subtotal)}</b>
</p>

<p>
CGST 9%:
<b>${money(r.cgst)}</b>
</p>

<p>
SGST 9%:
<b>${money(r.sgst)}</b>
</p>

<h3>
Total Amount GST:
${money(r.grandTotal)}
</h3>

</div>


<div class="box">

Uploaded Bill:
${esc(r.billFileName||"Not uploaded")}

</div>


<div class="sign">
Authorized Sign
</div>


</body>

</html>
`
}

function viewPurchaseInvoice(no){

  const r=
    purchases.find(
      x=>
        (x.vendorInvoiceNo||x.billNo)===no
    );


  if(!r)
    return alert(
      "Purchase invoice not found."
    );


  const w=
    window.open(
      "",
      "_blank"
    );


  if(!w)
    return alert(
      "Allow popups to view invoice."
    );


  w.document.write(
    purchasePrintHtml(r)
  );

  w.document.close()
}


/* =========================================================
   SALES
   ========================================================= */

function filterInvoiceItems(){

  const q=
    document.getElementById(
      "invoiceItemSearch"
    ).value.trim().toLowerCase();

  const box=
    document.getElementById(
      "invoiceSuggestions"
    );

  if(!q){

    box.innerHTML="";

    return
  }


  const list=
    items.filter(x=>
      [
        x.name,
        x.barcode,
        x.code
      ]
      .join(" ")
      .toLowerCase()
      .includes(q)
    )
    .slice(0,8);


  box.innerHTML=
    list.map(x=>`

      <div
        class="suggestion"
        onclick='selectInvoiceItem(${JSON.stringify(x.id)})'>

        <span>
          ${esc(x.name)}
        </span>

        <span>
          ${esc(x.barcode||x.code)}
          • Stock ${x.stock}
        </span>

      </div>

    `)
    .join("")||
    `<div class="suggestion">No item found</div>`
}

function selectInvoiceItem(id){

  const x=items.find(i=>String(i.id)===String(id));

  if(!x)return;

  selectedInvoiceId=x.id;

  const item=document.getElementById("invoiceItemSearch");
  const hsn=document.getElementById("invoiceHSN");
  const unit=document.getElementById("invoiceUnit");
  const rate=document.getElementById("invoiceRate");
  const stock=document.getElementById("invoiceStock");
  const selected=document.getElementById("selectedInvoiceItem");
  const suggestions=document.getElementById("invoiceSuggestions");

  if(item)
    item.value=x.name||"";

  /*
    HSN:
    Item Master -> Sales Invoice
    HSN cannot be manually changed.
  */
  if(hsn){
    hsn.value=x.hsn||x.hsnCode||"";
    hsn.readOnly=true;
  }

  if(unit)
    unit.value=x.unit||"Nos";

  /*
    IMPORTANT:
    Sale Rate is ALWAYS manual.
    Do NOT take x.saleRate here.
  */
  if(rate){
    rate.value="";
    rate.readOnly=false;
    rate.removeAttribute("readonly");
    rate.removeAttribute("disabled");
  }

  if(stock)
    stock.value=Number(x.stock)||0;

  if(selected){
    selected.textContent=
      `Selected: ${x.name} | HSN: ${x.hsn||x.hsnCode||"-"} | Stock: ${x.stock}`;
  }

  if(suggestions)
    suggestions.innerHTML="";
}

function addInvoiceLine(){

  if(!selectedInvoiceId){

    const q=
      document.getElementById(
        "invoiceItemSearch"
      ).value.trim();


    const x=
      items.find(
        i=>
          i.name.toLowerCase()===q.toLowerCase()||
          i.barcode===q
      );


    if(x)
      selectInvoiceItem(x.id)
  }


  if(!selectedInvoiceId)
    return alert(
      "Select a sales item."
    );


  const x=
    items.find(
      i=>i.id===selectedInvoiceId
    );


  const qty=
    +document.getElementById(
      "invoiceQty"
    ).value||0;


  const rate=
    +document.getElementById(
      "invoiceRate"
    ).value||0;


  if(qty<=0)
    return alert(
      "Enter valid quantity."
    );


  const current=
    pendingInvoiceQty(
      x.id
    );


  if(
    current+qty>x.stock
  ){

    return alert(
      `Insufficient stock. Available: ${x.stock-current}`
    )
  }


  const existing=
    invoiceLines.find(
      l=>l.itemId===x.id
    );


  if(existing){

    existing.qty+=qty

  }else{

    invoiceLines.push({

      itemId:x.id,

      name:x.name,

      hsn:x.hsn||"",

      qty,

      unit:x.unit||"Nos",

      rate

    })
  }


  resetInvoiceItemEntry();

  renderInvoiceLines();

  updateInvoiceTotals()
}

function pendingInvoiceQty(id){

  return invoiceLines
    .filter(
      l=>l.itemId===id
    )
    .reduce(
      (s,l)=>s+l.qty,
      0
    )
}

function resetInvoiceItemEntry(){

  document.getElementById(
    "invoiceItemSearch"
  ).value="";

  document.getElementById(
    "invoiceHSN"
  ).value="";

  document.getElementById(
    "invoiceUnit"
  ).value="";

  document.getElementById(
    "invoiceRate"
  ).value="";

  document.getElementById(
    "invoiceStock"
  ).value="";

  document.getElementById(
    "invoiceQty"
  ).value=1;

  document.getElementById(
    "selectedInvoiceItem"
  ).textContent=
    "No item selected";

  selectedInvoiceId=null
}

function renderInvoiceLines(){

  const body=
    document.getElementById(
      "invoiceLinesBody"
    );

  if(!body)return;


  body.innerHTML=
    invoiceLines.map(
      (l,i)=>{

        const amount=
          l.qty*l.rate;

        const cg=
          amount*.09;

        const sg=
          amount*.09;

        const total=
          amount+cg+sg;


        return `

          <tr>

            <td>${i+1}</td>

            <td>${esc(l.name)}</td>

            <td>${esc(l.hsn||"-")}</td>

            <td>${l.qty}</td>

            <td>${esc(l.unit)}</td>

            <td>${money(l.rate)}</td>

            <td>${money(amount)}</td>

            <td>${money(cg)}</td>

            <td>${money(sg)}</td>

            <td>${money(total)}</td>

            <td>

              <button
                type="button"
                class="action-btn danger-btn"
                onclick="removeInvoiceLine(${i})">

                Remove

              </button>

            </td>

          </tr>

        `
      }
    ).join("")||
    `<tr><td colspan="11" class="empty">No sales items added.</td></tr>`
}

function removeInvoiceLine(i){

  invoiceLines.splice(i,1);

  renderInvoiceLines();

  updateInvoiceTotals()
}

function updateInvoiceTotals(){

  const sub=
    invoiceLines.reduce(
      (s,l)=>s+l.qty*l.rate,
      0
    );

  const cg=sub*.09;
  const sg=sub*.09;
  const total=sub+cg+sg;


  const a=
    document.getElementById(
      "invoiceSubtotal"
    );

  const b=
    document.getElementById(
      "invoiceCGST"
    );

  const c=
    document.getElementById(
      "invoiceSGST"
    );

  const d=
    document.getElementById(
      "invoiceGrandTotal"
    );

  const w=
    document.getElementById(
      "amountWords"
    );


  if(a)a.textContent=money(sub);
  if(b)b.textContent=money(cg);
  if(c)c.textContent=money(sg);
  if(d)d.textContent=money(total);
  if(w)w.textContent=numberToWords(total)
}

const ones=[
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen"
];

const tens=[
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety"
];

function numberToWords(n){

  n=Number(n||0);

  const rupees=
    Math.floor(n);

  const paise=
    Math.round(
      (n-rupees)*100
    );


  function part(x){

    if(x<20)
      return ones[x];

    if(x<100)
      return tens[Math.floor(x/10)]||
        ""+
        (
          x%10
          ?" "+ones[x%10]
          :""
        );

    if(x<1000)
      return (
        ones[Math.floor(x/100)]+" Hundred"+
        (
          x%100
          ?" "+part(x%100)
          :""
        )
      );

    if(x<100000)
      return (
        part(Math.floor(x/1000))+
        " Thousand"+
        (
          x%1000
          ?" "+part(x%1000)
          :""
        )
      );

    if(x<10000000)
      return (
        part(Math.floor(x/100000))+
        " Lakh"+
        (
          x%100000
          ?" "+part(x%100000)
          :""
        )
      );

    return (
      part(Math.floor(x/10000000))+
      " Crore"+
      (
        x%10000000
        ?" "+part(x%10000000)
        :""
      )
    )
  }


  let s=
    `Rupees ${part(rupees)}`;

  if(paise)
    s+=
      ` and ${part(paise)} Paise`;

  return s+" Only"
}

function saveSale(e){

  e.preventDefault();


  if(!invoiceLines.length)
    return alert(
      "Add at least one sales item."
    );


  const customer=
    cap(
      document.getElementById(
        "customerName"
      ).value
    );


  if(!customer)
    return alert(
      "Enter customer name."
    );


  const mobile=
    document.getElementById(
      "customerMobile"
    ).value.trim();


  if(
    mobile&&
    !/^\d{10}$/.test(mobile)
  )
    return alert(
      "Mobile number must be 10 digits."
    );


  for(const l of invoiceLines){

    const x=
      items.find(
        i=>i.id===l.itemId
      );


    if(
      !x||
      pendingInvoiceQty(x.id)>x.stock
    ){

      return alert(
        "Insufficient stock for "+l.name
      )
    }
  }


  const sub=
    invoiceLines.reduce(
      (s,l)=>s+l.qty*l.rate,
      0
    );

  const cg=sub*.09;
  const sg=sub*.09;
  const total=sub+cg+sg;


  const no=
    document.getElementById(
      "invoiceNo"
    ).value;


  const date=
    document.getElementById(
      "invoiceDate"
    ).value||
    today();


  invoiceLines.forEach(l=>{

    const x=
      items.find(
        i=>i.id===l.itemId
      );


    x.stock-=l.qty;


    movements.unshift({

      date,

      type:"OUT",

      reference:no,

      itemId:x.id,

      item:x.name,

      qty:l.qty,

      rate:l.rate,

      total:l.qty*l.rate,

      party:customer
    })
  });


  const rec={

    date,

    invoiceNo:no,

    customerName:customer,

    customerMobile:mobile,

    customerEmail:
      document.getElementById(
        "customerEmail"
      ).value.trim(),

    customerGSTIN:
      document.getElementById(
        "customerGSTIN"
      ).value.trim(),

    customerAddress:
      document.getElementById(
        "customerAddress"
      ).value.trim(),

    lines:
      JSON.parse(
        JSON.stringify(
          invoiceLines
        )
      ),

    subtotal:sub,

    cgst:cg,

    sgst:sg,

    grandTotal:total,

    amountWords:
      numberToWords(total),

    terms:
      document.getElementById(
        "termsConditions"
      ).value,

    bank:
      document.getElementById(
        "bankDetails"
      ).value
  };


  sales.unshift(rec);

  save(
    ITEMS_KEY,
    items
  );

  save(
    SALES_KEY,
    sales
  );

  save(
    MOVE_KEY,
    movements
  );


  invoiceLines=[];

  selectedInvoiceId=null;


  document.getElementById(
    "salesForm"
  ).reset();


  document.getElementById(
    "invoiceDate"
  ).value=today();


  document.getElementById(
    "invoiceNo"
  ).value=
    nextInvoiceNo();


  renderAll();


  alert(
    "Sales Invoice saved. Stock OUT updated."
  )
}


/* =========================================================
   SALES HISTORY
   ========================================================= */

function renderSalesHistory(){

  const q=
    (
      document.getElementById(
        "salesHistorySearch"
      )?.value||""
    ).toLowerCase();


  const body=
    document.getElementById(
      "salesHistoryBody"
    );

  if(!body)return;


  body.innerHTML=
    sales
    .filter(x=>
      [
        x.invoiceNo,
        x.customerName,
        x.customerMobile,
        x.customerGSTIN,
        ...(x.lines||[]).map(
          l=>l.name
        )
      ]
      .join(" ")
      .toLowerCase()
      .includes(q)
    )
    .map(x=>`

      <tr>

        <td>${esc(x.date)}</td>

        <td>${esc(x.invoiceNo)}</td>

        <td>${esc(x.customerName)}</td>

        <td>${esc(x.customerMobile||"-")}</td>

        <td>${esc(x.customerGSTIN||"-")}</td>

        <td>${money(x.grandTotal)}</td>

        <td>

          <button
            class="action-btn"
            onclick='viewSalesInvoice(${JSON.stringify(x.invoiceNo)})'>

            View

          </button>

        </td>

      </tr>

    `)
    .join("")||
    `<tr><td colspan="7" class="empty">No sales records.</td></tr>`
}

function salePrintHtml(r){

  const rows=
    (r.lines||[])
    .map(
      (l,i)=>`

        <tr>

          <td>${i+1}</td>

          <td>${esc(l.name)}</td>

          <td>${esc(l.hsn||"-")}</td>

          <td>${l.qty}</td>

          <td>${esc(l.unit)}</td>

          <td>${money(l.rate)}</td>

          <td>${money(l.qty*l.rate)}</td>

        </tr>

      `
    )
    .join("");


  return `
<!doctype html>

<html>

<head>

<title>
${esc(r.invoiceNo)}
</title>

<style>

body{
  font-family:Arial;
  margin:25px;
  color:#172033
}

h1{
  margin:0;
  color:#07529a
}

.head{
  display:flex;
  justify-content:space-between
}

.box{
  border:1px solid #bbb;
  padding:12px;
  margin:15px 0
}

table{
  width:100%;
  border-collapse:collapse
}

th,td{
  border:1px solid #bbb;
  padding:8px
}

th{
  background:#eef5fc
}

.total{
  margin-left:auto;
  width:330px
}

.sign{
  margin:55px 0 0 auto;
  width:220px;
  text-align:center;
  border-top:1px solid #333;
  padding-top:7px
}

.terms{
  white-space:pre-wrap
}

@media print{
  button{
    display:none
  }
}

</style>

</head>

<body>

<button onclick="print()">
Print / Save PDF
</button>


<div class="head">

<div>

<h1>
SUVI INFOTECH
</h1>

<b>
TAX INVOICE
</b>

</div>

<div>

Invoice No:
<b>
${esc(r.invoiceNo)}
</b>

<br>

Date:
${esc(r.date)}

</div>

</div>


<div class="box">

<b>
Customer Details
</b>

<br>

Name:
${esc(r.customerName)}

<br>

Mobile:
${esc(r.customerMobile||"-")}

<br>

Email:
${esc(r.customerEmail||"-")}

<br>

GSTIN:
${esc(r.customerGSTIN||"-")}

<br>

Address:
${esc(r.customerAddress||"-")}

</div>


<table>

<thead>

<tr>

<th>SL.No.</th>

<th>Item / Description</th>

<th>HSN Code</th>

<th>Qty</th>

<th>Unit</th>

<th>Rate</th>

<th>Amount</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>


<div class="total">

<p>
Subtotal:
<b>${money(r.subtotal)}</b>
</p>

<p>
CGST 9%:
<b>${money(r.cgst)}</b>
</p>

<p>
SGST 9%:
<b>${money(r.sgst)}</b>
</p>

<h3>
Grand Total:
${money(r.grandTotal)}
</h3>

</div>


<div class="box">

<b>
Amount in Words:
</b>

${esc(r.amountWords)}

</div>


<div class="box">

<b>
Terms & Conditions
</b>

<div class="terms">
${esc(r.terms||"-")}
</div>

<br>

<b>
Bank Details
</b>

<div class="terms">
${esc(r.bank||"-")}
</div>

</div>


<div class="sign">
Authorized Sign
</div>


</body>

</html>
`
}

function viewSalesInvoice(no){

  const r=
    sales.find(
      x=>x.invoiceNo===no
    );


  if(!r)
    return alert(
      "Sales invoice not found."
    );


  const w=
    window.open(
      "",
      "_blank"
    );


  if(!w)
    return alert(
      "Allow popups to view invoice."
    );


  w.document.write(
    salePrintHtml(r)
  );

  w.document.close()
}

function printCurrentSale(){

  const no=
    document.getElementById(
      "invoiceNo"
    ).value;


  const r=
    sales.find(
      x=>x.invoiceNo===no
    );


  if(r){

    viewSalesInvoice(no);

    return
  }


  if(!invoiceLines.length)
    return alert(
      "Add items first or save invoice."
    );


  const sub=
    invoiceLines.reduce(
      (s,l)=>s+l.qty*l.rate,
      0
    );

  const cg=sub*.09;
  const sg=sub*.09;


  const temp={

    invoiceNo:no,

    date:
      document.getElementById(
        "invoiceDate"
      ).value||
      today(),

    customerName:
      cap(
        document.getElementById(
          "customerName"
        ).value
      ),

    customerMobile:
      document.getElementById(
        "customerMobile"
      ).value,

    customerEmail:
      document.getElementById(
        "customerEmail"
      ).value,

    customerGSTIN:
      document.getElementById(
        "customerGSTIN"
      ).value,

    customerAddress:
      document.getElementById(
        "customerAddress"
      ).value,

    lines:invoiceLines,

    subtotal:sub,

    cgst:cg,

    sgst:sg,

    grandTotal:sub+cg+sg,

    amountWords:
      numberToWords(
        sub+cg+sg
      ),

    terms:
      document.getElementById(
        "termsConditions"
      ).value,

    bank:
      document.getElementById(
        "bankDetails"
      ).value
  };


  const w=
    window.open(
      "",
      "_blank"
    );


  if(w){

    w.document.write(
      salePrintHtml(temp)
    );

    w.document.close()
  }
}

function saveCurrentSalePDF(){
  printCurrentSale()
}


/* =========================================================
   STOCK
   ========================================================= */

function renderStock(){

  const q=
    (
      document.getElementById(
        "stockSearch"
      )?.value||""
    ).toLowerCase();


  const body=
    document.getElementById(
      "stockBody"
    );

  if(!body)return;


  body.innerHTML=
    items
    .filter(x=>
      [
        x.code,
        x.name,
        x.barcode
      ]
      .join(" ")
      .toLowerCase()
      .includes(q)
    )
    .map(x=>{

      const low=
        Number(x.stock||0)<=
        Number(x.minStock||0);


      return `

        <tr>

          <td>${esc(x.code)}</td>

          <td>${esc(x.name)}</td>

          <td>${esc(x.barcode||"-")}</td>

          <td>${x.stock}</td>

          <td>${esc(x.unit)}</td>

          <td>${money(x.purchaseRate)}</td>

          <td>${money(x.saleRate)}</td>

         <td>${Number(x.minStock)||0}</td>

          <td class="status-badge ${low?"low":"ok"}">
            ${low?"LOW":"OK"}
          </td>

          <td>
            ${money(
  (Number(x.stock)||0)*
  (Number(x.purchaseRate)||0)
)}
          </td>

        </tr>

      `
    })
    .join("")||
    `<tr><td colspan="10" class="empty">No stock records.</td></tr>`
}

function renderMovements(){

  const body=
    document.getElementById(
      "movementBody"
    );

  if(!body)return;


  body.innerHTML=
    movements.map(m=>`

      <tr>

        <td>${esc(m.date)}</td>

        <td>${esc(m.type)}</td>

        <td>${esc(m.reference)}</td>

        <td>${esc(m.item)}</td>

        <td>${m.qty}</td>

        <td>${money(m.rate)}</td>

        <td>${money(m.total)}</td>

        <td>${esc(m.party||"")}</td>

      </tr>

    `)
    .join("")||
    `<tr><td colspan="8" class="empty">No movement records.</td></tr>`
}


/* =========================================================
   SUPPLIER
   ========================================================= */

function saveSupplier(e){

  e.preventDefault();


  const name=
    cap(
      document.getElementById(
        "supplierName"
      ).value
    );


  const mobile=
    document.getElementById(
      "supplierMobile"
    ).value.trim();


  if(
    mobile&&
    !/^\d{10}$/.test(mobile)
  )
    return alert(
      "Mobile must be 10 digits."
    );


  if(
    suppliers.some(
      x=>
        x.name.toLowerCase()===
        name.toLowerCase()
    )
  )
    return alert(
      "Supplier already exists."
    );


  suppliers.push({

    id:crypto.randomUUID(),

    name,

    mobile,

    gstin:
      document.getElementById(
        "supplierGSTIN"
      ).value.trim(),

    address:
      document.getElementById(
        "supplierAddress"
      ).value.trim()
  });


  save(
    SUP_KEY,
    suppliers
  );


  document.getElementById(
    "supplierForm"
  ).reset();


  renderAll();


  alert(
    "Supplier saved."
  )
}

function renderSuppliers(){

  const body=document.getElementById("supplierBody");
  const form=document.getElementById("supplierForm");

  if(!body)return;

  /* Add Supplier button */
  let addBtn=document.getElementById("supplierAddBtn");

  if(!addBtn){

    addBtn=document.createElement("button");

    addBtn.id="supplierAddBtn";
    addBtn.type="button";
    addBtn.className="supplier-add-btn";
    addBtn.innerHTML="＋ Add Supplier";

    addBtn.onclick=function(){
      if(!form)return;

      form.style.display="block";
      form.dataset.open="1";

      addBtn.innerHTML="✕ Close";

      document.getElementById("supplierName")?.focus();
    };

    if(form){
      form.parentNode.insertBefore(addBtn,form);
    }
  }

  /* Form hidden initially */
  if(form && form.dataset.open!=="1"){
    form.style.display="none";
  }

  /* Build supplier list */
  const list=[...suppliers];

  /* Add suppliers already present in purchase history */
  purchases.forEach(p=>{

    const name=String(p.vendor||"").trim();

    if(!name)return;

    const exists=list.some(
      s=>String(s.name||"").toLowerCase()===name.toLowerCase()
    );

    if(!exists){

      list.push({
        id:"AUTO_"+name,
        name:name,
        mobile:p.vendorMobile||"",
        gstin:p.vendorGSTIN||"",
        address:p.vendorAddress||"",
        auto:true
      });
    }
  });

  body.innerHTML=list.map(x=>`

    <tr>

      <td>
        <strong>${esc(x.name)}</strong>
      </td>

      <td>
        ${esc(x.mobile||"-")}
      </td>

      <td>
        ${esc(x.gstin||"-")}
      </td>

      <td>
        ${esc(x.address||"-")}
      </td>

      <td>

        <button
          type="button"
          class="action-btn edit-btn"
          onclick='editSupplier(${JSON.stringify(x.id)})'>
          ✎ Edit
        </button>

        ${
          x.auto
          ? `<span class="auto-supplier-badge">AUTO</span>`
          : `
            <button
              type="button"
              class="action-btn danger-btn"
              onclick='deleteSupplier(${JSON.stringify(x.id)})'>
              🗑 Delete
            </button>
          `
        }

      </td>

    </tr>

  `).join("") ||
  `
    <tr>
      <td colspan="5" class="empty">
        No suppliers.
      </td>
    </tr>
  `;
}
function editSupplier(id){

  let x=suppliers.find(s=>s.id===id);

  /* If supplier came automatically from Purchase History */
  if(!x){

    const p=purchases.find(p=>
      "AUTO_"+String(p.vendor||"").trim()===id
    );

    if(!p)return;

    x={
      id:null,
      name:p.vendor||"",
      mobile:p.vendorMobile||"",
      gstin:p.vendorGSTIN||"",
      address:p.vendorAddress||""
    };
  }

  const form=document.getElementById("supplierForm");

  if(form){

    form.style.display="block";
    form.dataset.open="1";
    form.dataset.editId=x.id||"";

    document.getElementById("supplierName").value=x.name||"";
    document.getElementById("supplierMobile").value=x.mobile||"";
    document.getElementById("supplierGSTIN").value=x.gstin||"";
    document.getElementById("supplierAddress").value=x.address||"";
  }

  const btn=document.getElementById("supplierAddBtn");

  if(btn)
    btn.innerHTML="✕ Close";
}

function toggleSupplierForm(){

  const form = document.getElementById("supplierForm");
  const btn = document.getElementById("supplierAddBtn");

  if(!form) return;

  const isOpen = form.style.display !== "none";

  if(isOpen){

    form.style.display = "none";
    form.dataset.open = "";

    if(btn){
      btn.innerHTML = "＋ Add Supplier";
    }

    form.reset();
    form.dataset.editId = "";

  }else{

    form.style.display = "block";
    form.dataset.open = "1";

    if(btn){
      btn.innerHTML = "✕ Close";
    }

    document.getElementById("supplierName")?.focus();
  }
}

function deleteSupplier(id){

  if(!confirm(
    "Delete supplier?"
  ))return;


  suppliers=
    suppliers.filter(
      x=>x.id!==id
    );


  save(
    SUP_KEY,
    suppliers
  );


  renderAll()
}


/* =========================================================
   STOCK ADJUSTMENT
   ========================================================= */

function filterAdjustmentItems(){

  const q=
    document.getElementById(
      "adjustmentItemSearch"
    ).value.trim().toLowerCase();


  const box=
    document.getElementById(
      "adjustmentSuggestions"
    );


  if(!q){

    box.innerHTML="";

    return
  }


  const list=
    items.filter(x=>
      [
        x.name,
        x.barcode,
        x.code
      ]
      .join(" ")
      .toLowerCase()
      .includes(q)
    )
    .slice(0,8);


  box.innerHTML=
    list.map(x=>`

      <div
        class="suggestion"
        onclick='selectAdjustmentItem(${JSON.stringify(x.id)})'>

        <span>
          ${esc(x.name)}
        </span>

        <span>
          ${esc(x.barcode||x.code)}
          • Stock ${x.stock}
        </span>

      </div>

    `)
    .join("")||
    `<div class="suggestion">No item found</div>`
}

function selectAdjustmentItem(id){

  const x=
    items.find(
      i=>i.id===id
    );

  if(!x)return;


  selectedAdjustmentId=id;


  document.getElementById(
    "adjustmentItemSearch"
  ).value=x.name;


  document.getElementById(
    "adjustmentSelected"
  ).textContent=
    `Selected: ${x.name} | Current Stock: ${x.stock}`;


  document.getElementById(
    "adjustmentSuggestions"
  ).innerHTML=""
}

function saveAdjustment(e){

  e.preventDefault();


  if(!selectedAdjustmentId){

    const q=
      document.getElementById(
        "adjustmentItemSearch"
      ).value.trim();


    const x=
      items.find(
        i=>
          i.name.toLowerCase()===q.toLowerCase()||
          i.barcode===q
      );


    if(x)
      selectAdjustmentItem(x.id)
  }


  if(!selectedAdjustmentId)
    return alert(
      "Select item."
    );


  const x=
    items.find(
      i=>i.id===selectedAdjustmentId
    );


  const type=
    document.getElementById(
      "adjustmentType"
    ).value;


  const qty=
    +document.getElementById(
      "adjustmentQty"
    ).value||0;


  const reason=
    document.getElementById(
      "adjustmentReason"
    ).value.trim();


  if(qty<=0)
    return alert(
      "Enter valid quantity."
    );


  if(
    type==="OUT"&&
    qty>x.stock
  )
    return alert(
      "Stock OUT cannot exceed current stock."
    );


  x.stock+=
    type==="IN"
    ?qty
    :-qty;


  const rec={

    date:today(),

    itemId:x.id,

    item:x.name,

    type,

    qty,

    reason,

    balance:x.stock
  };


  adjustments.unshift(rec);


  movements.unshift({

    date:rec.date,

    type,

    reference:"ADJ",

    itemId:x.id,

    item:x.name,

    qty,

    rate:0,

    total:0,

    party:reason
  });


  save(
    ITEMS_KEY,
    items
  );

  save(
    ADJ_KEY,
    adjustments
  );

  save(
    MOVE_KEY,
    movements
  );


  document.getElementById(
    "adjustmentForm"
  ).reset();


  document.getElementById(
    "adjustmentSelected"
  ).textContent=
    "No item selected";


  selectedAdjustmentId=null;


  renderAll();


  alert(
    "Stock adjustment saved."
  )
}

function renderAdjustments(){

  const body=
    document.getElementById(
      "adjustmentBody"
    );

  if(!body)return;


  body.innerHTML=
    adjustments.map(x=>`

      <tr>

        <td>${esc(x.date)}</td>

        <td>${esc(x.item)}</td>

        <td>${esc(x.type)}</td>

        <td>${x.qty}</td>

        <td>${esc(x.reason)}</td>

        <td>${x.balance}</td>

      </tr>

    `)
    .join("")||
    `<tr><td colspan="6" class="empty">No adjustments.</td></tr>`
}


/* =========================================================
   BARCODE
   ========================================================= */

function barcodeKeyDown(e){

  if(e.key!=="Enter")
    return;


  e.preventDefault();


  const b=
    e.target.value.trim();


  const x=
    items.find(
      i=>i.barcode===b
    );


  if(!x)
    return alert(
      "Barcode not found."
    );


  const active=
    document.querySelector(
      ".tab-content.active"
    )?.id;


  if(
    active==="salesTab"&&
    document.getElementById(
      "barcodeAutoAdd"
    )?.checked
  ){

    selectInvoiceItem(x.id);

    addInvoiceLine();

    return
  }


  e.target.value=
    x.barcode;


  const search=
    document.getElementById(
      "itemSearch"
    );

  if(search)
    search.value=x.barcode;


  renderItems()
}

function barcodeAutoAddKey(e,mode){

  if(
    mode!=="sales"||
    e.key!=="Enter"
  )
    return;


  const b=
    e.target.value.trim();


  if(!b)return;


  const x=
    items.find(
      i=>i.barcode===b
    );


  if(!x)return;


  if(
    document.getElementById(
      "barcodeAutoAdd"
    )?.checked
  ){

    e.preventDefault();

    selectInvoiceItem(x.id);

    addInvoiceLine()
  }
}

function printBarcode(id){

  const x=
    items.find(
      i=>i.id===id
    );


  if(!x)return;


  const w=
    window.open(
      "",
      "_blank"
    );


  if(!w)
    return alert(
      "Allow popups to print barcode."
    );


  w.document.write(`

    <html>

    <head>

      <title>
        Barcode - ${esc(x.name)}
      </title>

      <style>

        body{
          text-align:center;
          font-family:Arial;
          padding:30px
        }

        .code{
          font-weight:800;
          margin:10px
        }

      </style>

    </head>

    <body>

      <h2>
        SUVI INFOTECH
      </h2>

      <div>
        ${esc(x.name)}
      </div>

      ${renderBarcodeSVG(
        x.barcode,
        420,
        90
      )}

      <div class="code">
        ${esc(x.barcode)}
      </div>

      <button onclick="print()">
        Print Barcode
      </button>

    </body>

    </html>

  `);

  w.document.close()
}

function printTable(id,title){

  const t=
    document.getElementById(id);

  if(!t)return;


  const w=
    window.open(
      "",
      "_blank"
    );


  if(!w)
    return alert(
      "Allow popups to print."
    );


  w.document.write(`

    <html>

    <head>

      <title>
        ${esc(title)}
      </title>

      <style>

        body{
          font-family:Arial;
          margin:20px
        }

        h2{
          color:#07529a
        }

        table{
          width:100%;
          border-collapse:collapse
        }

        th,td{
          border:1px solid #aaa;
          padding:7px;
          font-size:12px
        }

        th{
          background:#eef5fc
        }

        @media print{

          button{
            display:none
          }

        }

      </style>

    </head>

    <body>

      <button onclick="print()">
        Print
      </button>

      <h2>
        SUVI INFOTECH - ${esc(title)}
      </h2>

      ${t.outerHTML}

    </body>

    </html>

  `);

  w.document.close()
}


document.addEventListener(
  "DOMContentLoaded",
  init
);