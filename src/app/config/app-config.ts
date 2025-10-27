import { environment } from "../../environments/environment";
import { AppConfig } from "../commons/models/app-config.interface";
export const appUrl = environment;

export const AppConfigValues: AppConfig = {
    appTitle: "Technical Route or Synthesis Database - Chemical Processes and Synthesis",
    appUrls: {
      domainPaths: {
        routeOfSynthesis: '/agropat/images/route_of_synthesis/',
        companyLogo: '/agropat/images/innovators_logo/',
        googlePatent: 'https://patents.google.com/patent/',
        espacentUrl: 'https://worldwide.espacenet.com/patent/search/family/042310208/publication/',
        basicRouteStructure: '/agropat/images/chemical_structure/',
        chemicalDirectoryStructure: '/agropat/images/chemical_directory_structures/',
        countryFlag: '/agropat/images/flag/',
      },
      basicProductInfo: {
        simpleSearchSuggestions: `${appUrl.apiUrl}/basic-product-info/simple-auto-suggestions`,
        simpleSearchResults: `${appUrl.apiUrl}/basic-product-info/simple-search`,
        searchSpecific: `${appUrl.apiUrl}/basic-product-info/search-specific`,
        columnList: `${appUrl.apiUrl}/basic-product-info/column-list`,
        filterColumns: `${appUrl.apiUrl}/basic-product-info/filter-columns`,
        advanceAutoSuggestions: `${appUrl.apiUrl}/basic-product-info/advance-auto-suggestions`,
        advanceSearchResults: `${appUrl.apiUrl}/basic-product-info/advance-search`,
        productHighlights:`${appUrl.apiUrl}/basic-product-info/product-highlight`,//683eccdfe449b3512e3ec59b
        reportData: `${appUrl.apiUrl}/basic-product-info/report-data`,
        downloadexcel: `${appUrl.devApiUrl}/basic-product-info/download-excel`,
      },
      technicalRoutes: {
        filterColumnList: `${appUrl.apiUrl}/technical-routes/filter-column-list`,
        columnList: `${appUrl.apiUrl}/technical-routes/column-list`,
        autoSuggestions: `${appUrl.apiUrl}/technical-routes/auto-suggestions`,
        synthesisAutoSuggestions: `${appUrl.apiUrl}/technical-routes/synthesis-search/auto-suggestions`,
        synthesisSearch: `${appUrl.apiUrl}/technical-routes/synthesis-search`,
        searchSpecific: `${appUrl.apiUrl}/technical-routes/search-specific`,
        reportData: `${appUrl.apiUrl}/technical-routes/report-data`,
      },
      dmf: {
        searchSpecific: `${appUrl.apiUrl}/tech-supplier/search-specific`,
        columnList: `${appUrl.apiUrl}/tech-supplier/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/tech-supplier/download-excel`,
      },
      chemicalDirectory: {
        filterColumns: `${appUrl.apiUrl}/chemical-directory/filter-columns`,
        searchSpecific: `${appUrl.apiUrl}/chemical-directory/search-specific`,
        structureFilterColumns: `${appUrl.apiUrl}/chemical-directory/structure-filter-columns`,
        intermediateApplicationSearch: `${appUrl.apiUrl}/chemical-directory/intermediate-application-search`,
        autoSuggestions: `${appUrl.apiUrl}/chemical-directory/auto-suggestions`,
        columnList: `${appUrl.apiUrl}/chemical-directory/column-list`,
        reportData: `${appUrl.apiUrl}/chemical-directory/report-data`,
        downloadexcel: `${appUrl.devApiUrl}/chemical-directory/download-excel`,
      },
      impurity: {
        searchSpecific: `${appUrl.apiUrl}/impurity/search-specific`,
        columnList: `${appUrl.apiUrl}/impurity/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/impurity/download-excel`,
      },
      impPatents: {
        searchSpecific: `${appUrl.apiUrl}/imp-patents/search-specific`,
        columnList: `${appUrl.apiUrl}/imp-patents/column-list`,
        downloadexcel: `${appUrl.apiUrl}/imp-patents/download-excel`,
      },
      europeApproval: {
        searchSpecific: `${appUrl.apiUrl}/ema/search-specific`,
        columnList: `${appUrl.apiUrl}/ema/column-list`,
      },
      canadaApproval: {
        searchSpecific: `${appUrl.apiUrl}/health-canada/search-specific`,
        columnList: `${appUrl.apiUrl}/health-canada/column-list`,
      },
      japanApproval: {
        searchSpecific: `${appUrl.apiUrl}/japan-pmda/search-specific`,
        columnList: `${appUrl.apiUrl}/japan-pmda/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/japan-pmda/download-excel`,
      },
      koreaApproval: {
        searchSpecific: `${appUrl.apiUrl}/korea-orange-book/search-specific`,
        columnList: `${appUrl.apiUrl}/korea-orange-book/column-list`,
      },
      usApproval: {
        searchSpecific: `${appUrl.apiUrl}/orange-book-us/search-specific`,
        columnList: `${appUrl.apiUrl}/orange-book-us/column-list`,
      },
      purpleBook: {
        searchSpecific: `${appUrl.apiUrl}/purple-book/search-specific`,
        columnList: `${appUrl.apiUrl}/purple-book/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/purple-book/download-excel`,
      },
      veterinaryUsApproval: {
        searchSpecific: `${appUrl.apiUrl}/green-book-us/search-specific`,
        columnList: `${appUrl.apiUrl}/green-book-us/column-list`,
      },
      activePatent: {
        searchSpecific: `${appUrl.apiUrl}/active-patent/search-specific`,
        columnList: `${appUrl.apiUrl}/active-patent/column-list`,
      },
      nonPatentLandscape: {
        searchSpecific: `${appUrl.apiUrl}/non-patent/search-specific`,
        columnList: `${appUrl.apiUrl}/non-patent/column-list`,
      },
      indianMedicine: {
        searchSpecific: `${appUrl.apiUrl}/indian-medicine/search-specific`,
        columnList: `${appUrl.apiUrl}/indian-medicine/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/indian-medicine/download-excel`,
      },
      litigation: {
        searchSpecific: `${appUrl.apiUrl}/litigation/search-specific`,
        columnList: `${appUrl.apiUrl}/litigation/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/litigation/download-excel`,
      },
      spcDb: {
        searchSpecific: `${appUrl.devApiUrl}/spc/search-specific`,
        columnList: `${appUrl.devApiUrl}/spc/column-list`,
      },
      gppdDb: {
        searchSpecific: `${appUrl.apiUrl}/gppd/search-specific`,
        columnList: `${appUrl.apiUrl}/gppd/column-list`,
      },
      chemiTracker: {
        searchSpecific: `${appUrl.apiUrl}/chemi-tracker/search-specific`,
        columnList: `${appUrl.apiUrl}/chemi-tracker/column-list`,
        downloadexcel: `${appUrl.apiUrl}/chemi-tracker/download-excel`,
      },
      scientificDocs: {
        searchSpecific: `${appUrl.apiUrl}/scientific-docs/search-specific`,
        columnList: `${appUrl.apiUrl}/scientific-docs/column-list`,
        downloadexcel: `${appUrl.devApiUrl}/scientific-docs/download-excel`
      },
      eximData: {
        searchSpecific: `${appUrl.apiUrl}/ximm/search-specific`,
        columnList: `${appUrl.apiUrl}/ximm/column-list`,
        
      },
      user: {
        privilegeApi: `${appUrl.apiUrl}/user-info`,
        todayPrivilegeApi: `${appUrl.apiUrl}/user-today-history`,
      },
      authentication: {
        loginUrl: `${appUrl.apiUrl}/login`,
        accessLoginApi: `${appUrl.apiUrl}/login-user/`,
      },
     vertical: {
      verticalcategory: `${appUrl.apiUrl}/vertical-category-info`,
    },
      pdfGeneration: {
        generatePdf: `${appUrl.apiUrl}/generate-pdf`,
      },
      query: {
        raiseQuery: `${appUrl.apiUrl}/raise-query`,
      }
    } 
}