
import { environment } from "../../environments/environment";
import { AppConfig } from "../commons/models/app-config.interface";
export const appUrl = environment;

export const AppConfigValues: AppConfig = {
    appTitle: "Digital Rock",
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
    
      chemicalDirectory: {
        filterColumns: `${appUrl.apiUrl}/chemical-directory/filter-columns`,
        searchSpecific: `${appUrl.apiUrl}/chemical-directory/search-specific`,
        structureFilterColumns: `${appUrl.apiUrl}/chemical-directory/structure-filter-columns`,
        intermediateApplicationSearch: `${appUrl.apiUrl}/chemical-directory/intermediate-application-search`,
        autoSuggestions: `${appUrl.apiUrl}/chemical-directory/auto-suggestions`,
        columnList: `${appUrl.apiUrl}/chemical-directory/column-list`,
        reportData: `${appUrl.apiUrl}/chemical-directory/report-data`,
      },
    
      impurity: {
        searchSpecific: `${appUrl.apiUrl}/impurity/search-specific`,
        columnList: `${appUrl.apiUrl}/impurity/column-list`,
      },
    
      chemiTracker: {
        searchSpecific: `${appUrl.apiUrl}/chemi-tracker/search-specific`,
        columnList: `${appUrl.apiUrl}/chemi-tracker/column-list`,
      },
    
      user: {
        privilegeApi: `${appUrl.apiUrl}/user-info`,
        todayPrivilegeApi: `${appUrl.apiUrl}/user-today-history`,
      },
    
      authentication: {
        loginUrl: `${appUrl.apiUrl}/login`,
        accessLoginApi: `${appUrl.apiUrl}/login-user/`,
      },
    
      pdfGeneration: {
        generatePdf: `${appUrl.apiUrl}/generate-pdf`,
      },
    
      query: {
        raiseQuery: `${appUrl.apiUrl}/raise-query`,
      }
}