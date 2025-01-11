export interface AppConfig {
  appTitle: string;
  appUrls: {
    domainPaths: {
      routeOfSynthesis: string;
      companyLogo: string;
      googlePatent: string;
      espacentUrl: string;
      basicRouteStructure: string;
      chemicalDirectoryStructure: string;
      countryFlag: string;
    };
    basicProductInfo: {
      simpleSearchSuggestions: string;
      simpleSearchResults: string;
      searchSpecific: string;
      columnList: string;
      filterColumns: string;
      advanceAutoSuggestions: string;
    };
    technicalRoutes: {
      filterColumnList: string;
      columnList: string;
      autoSuggestions: string;
      synthesisAutoSuggestions: string;
      synthesisSearch: string;
      searchSpecific: string;
      reportData: string;
    };
    chemicalDirectory: {
      filterColumns: string;
      searchSpecific: string;
      structureFilterColumns: string;
      intermediateApplicationSearch: string;
      autoSuggestions: string;
      columnList: string;
      reportData: string;
    };
    impurity: {
      searchSpecific: string;
      columnList: string;
    };
    chemiTracker: {
      searchSpecific: string;
      columnList: string;
    };
    user: {
      privilegeApi: string;
      todayPrivilegeApi: string;
    };
    authentication: {
      loginUrl: string;
      accessLoginApi: string;
    };
    pdfGeneration: {
      generatePdf: string;
    };
    query: {
      raiseQuery: string;
    };
  }
}
  