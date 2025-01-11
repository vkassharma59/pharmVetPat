import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const RESULT_TABS = [
  { name: 'productInfo', label: 'Product Info', isActive: true },
  { name: 'impPatents', label: 'IMP Patents', isActive: false },
  { name: 'technicalRoutes', label: 'Technical Routes', isActive: false },
  { name: 'dmfSuppliers', label: 'DMF or Suppliers', isActive: false },
  { name: 'chemicalDirectory', label: 'Chemical Directory (Building Block)', isActive: false },
  { name: 'ksmSuppliers', label: 'KSM Suppliers', isActive: false },
  { name: 'impurity', label: 'Impurity', isActive: false },
  { name: 'usApproval', label: 'US Approval (Orange Book)', isActive: false },
  { name: 'veterinaryUsApproval', label: 'Veterinary US Approval (Orange Book)', isActive: false },
  { name: 'europeApproval', label: 'Europe Approval (EMA)', isActive: false },
  { name: 'canadaApproval', label: 'Canada Approval (Health Canada)', isActive: false },
  { name: 'japanApproval', label: 'Japan Approval (PMDA)', isActive: false },
  { name: 'koreaApproval', label: 'Korea Approval (Orange Book)', isActive: false },
  { name: 'indianMedicine', label: 'Indian Medicine', isActive: false },
  { name: 'gppdDb', label: 'GPPD DB', isActive: false },
  { name: 'patentLandscape', label: 'Patent Landscape', isActive: false },
  { name: 'nonPatentLandscape', label: 'Non-Patent Landscape', isActive: false },
  { name: 'litigation', label: 'Litigation', isActive: false },
  { name: 'scientificDocs', label: 'Scientific Docs', isActive: false },
  { name: 'spcDb', label: 'SPC DB', isActive: false },
  { name: 'eximData', label: 'EXIM Data', isActive: false }
];

@Injectable({
  providedIn: 'root'
})

export class UtilityService {

  private tabsSubject = new BehaviorSubject(RESULT_TABS);
  tabs$ = this.tabsSubject.asObservable();

  setActiveTab(tabName: string): void {
    const updatedTabs = this.tabsSubject.getValue().map(tab => ({
      ...tab,
      isActive: tab.name === tabName
    }));
    this.tabsSubject.next(updatedTabs);
  }

  resetTabs(): void {
    const resetTabs = this.tabsSubject.getValue().map(tab => ({
      ...tab,
      isActive: false
    }));
    this.tabsSubject.next(resetTabs);
  }

  getActiveTab(): string | null {
    const activeTab = this.tabsSubject.getValue().find((tab) => tab.isActive);
    return activeTab ? activeTab.name : null;
  }
  
  getAllTabsName(): { [key: string]: any } {
    const tabs = this.tabsSubject.getValue();
    return tabs.reduce((acc: { [key: string]: any }, tab: any) => {
      acc[tab.name] = tab; // key is tab name, value is the tab object
      return acc;
    }, {});
  }

  getDataStates(): Record<number, Record<string, any>> {
    const statesCount = 25;
    return Array.from({ length: statesCount }, (_, index) => ({
      [index]: RESULT_TABS.reduce<Record<string, any>>((acc, tab) => {
        acc[tab.name] = {};
        return acc;
      }, {})
    })).reduce((acc, item) => ({ ...acc, ...item }), {});
  }
}

export const searchTypes = {
  simpleSearch: 'simple-search',
  chemicalStructure: 'chemical-structure',
  synthesisSearch: 'synthesis-search',
  intermediateSearch: 'intermediate-search',
  advanceSearch: 'advance-search',
}