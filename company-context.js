// =========================================================
// SUVI INFOTECH - COMPANY / TENANT CONTEXT
// =========================================================

window.SuviCompany = {

    companyId: null,

    setCompanyId(companyId) {
        this.companyId = companyId;
        localStorage.setItem("SUVI_COMPANY_ID", companyId);
    },

    getCompanyId() {
        return this.companyId ||
               localStorage.getItem("SUVI_COMPANY_ID");
    },

    clearCompanyId() {
        this.companyId = null;
        localStorage.removeItem("SUVI_COMPANY_ID");
    }

};