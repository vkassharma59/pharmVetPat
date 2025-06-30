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
      advanceSearchResults: string;
      productHighlights:string;
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
    impPatents: {
      searchSpecific: string;
      columnList: string;
    };
    europeApproval: {
      searchSpecific: string;
      columnList: string;
    };
    canadaApproval: {
      searchSpecific: string;
      columnList: string;
    };
    japanApproval: {
      searchSpecific: string;
      columnList: string;
    };
    koreaApproval: {
      searchSpecific: string;
      columnList: string;
    };
    usApproval: {
      searchSpecific: string;
      columnList: string;
    };
    indianMedicine: {
      searchSpecific: string;
      columnList: string;
    };
    litigation: {
      searchSpecific: string;
      columnList: string;
    };
    spcDb: {
      searchSpecific: string;
      columnList: string;
    }
    gppdDb: {
      searchSpecific: string;
      columnList: string;
    }
    chemiTracker: {
      searchSpecific: string;
      columnList: string;
    };
   veterinaryUsApproval: {
     searchSpecific: string;
    columnList: string;
    };
      activePatent: {
      searchSpecific: string;
      columnList: string;
    };
    nonPatentLandscape: {
      searchSpecific: string;
      columnList: string;
    },
    scientificDocs: {
      searchSpecific: string;
      columnList: string;
    };
    eximData: {
      searchSpecific: string;
      columnList: string;
    },
    user: {
      privilegeApi: string;
      todayPrivilegeApi: string;
    };
    authentication: {
      loginUrl: string;
      accessLoginApi: string;
    };
    vertical: {
      verticalcategory: string,
    },
    pdfGeneration: {
      generatePdf: string;
    };
    query: {
      raiseQuery: string;
    };
  }
}
