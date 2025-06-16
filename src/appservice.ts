import { Injectable } from '@angular/core';
import { AppConfigValues } from './app/config/app-config';
import { AppConfig } from './app/commons/models/app-config.interface'; // adjust path as needed

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  public apiUrls: AppConfig['appUrls'] = AppConfigValues.appUrls;
}
