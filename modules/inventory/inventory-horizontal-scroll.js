/* =========================================================
   INVENTORY TABLE HORIZONTAL SCROLL BUTTONS
   ========================================================= */

(function () {

    function addHorizontalButtons() {

        const wrapper = document.querySelector(
            "#itemTable"
        )?.closest(".table-wrapper");

        if (!wrapper) return;

        if (document.getElementById("itemHorizontalControls"))
            return;

        const controls = document.createElement("div");

        controls.id = "itemHorizontalControls";

        controls.innerHTML = `
            <button type="button" id="itemScrollLeft">‹</button>
            <button type="button" id="itemScrollRight">›</button>
        `;

        wrapper.parentElement.insertBefore(
            controls,
            wrapper
        );

        document
            .getElementById("itemScrollLeft")
            .addEventListener("click", function () {

                wrapper.scrollBy({
                    left: -500,
                    behavior: "smooth"
                });

            });

        document
            .getElementById("itemScrollRight")
            .addEventListener("click", function () {

                wrapper.scrollBy({
                    left: 500,
                    behavior: "smooth"
                });

            });
    }


    function initHorizontalScroll() {

        addHorizontalButtons();

        setTimeout(
            addHorizontalButtons,
            500
        );

        setTimeout(
            addHorizontalButtons,
            1500
        );
    }


    document.addEventListener(
        "DOMContentLoaded",
        initHorizontalScroll
    );

})();
/* =========================================================
   HORIZONTAL SCROLL BUTTON STYLE
   ========================================================= */

const itemScrollStyle = document.createElement("style");

itemScrollStyle.textContent = `
#itemHorizontalControls {
    display:flex;
    justify-content:flex-end;
    align-items:center;
    gap:8px;
    margin:8px 0;
}

#itemHorizontalControls button {
    width:42px;
    height:36px;
    border:none;
    border-radius:8px;
    background:#eaf3ff;
    color:#075ca8;
    font-size:28px;
    font-weight:800;
    line-height:1;
    cursor:pointer;
}

#itemHorizontalControls button:hover {
    background:#d7eaff;
}

.table-wrapper {
    overflow-x:auto !important;
    overflow-y:hidden !important;
    scroll-behavior:smooth;
}
`;

document.head.appendChild(itemScrollStyle);