import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {catchError, concatMap, delay, EMPTY, filter, from, map, switchMap, tap, throwError} from 'rxjs';
import { OfsMessageService } from './services/ofs-message.service';
import { Message } from './types/models/message';
import { OfsRestApiService } from './services/ofs-rest-api.service';
import { ImageAnalyzerService } from './services/image-analyzer.service';
import Image from 'image-js';
import { DialogService } from "./services/dialog.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SurveyData } from "./types/plugin-types";
import {
  GetAResourceResponse,
  GetChildResourcesResponse,
  UpdateAnActivityBodyParams
} from "./types/ofs-rest-api";
import {tecnicosAdicionalesRequest} from "./types/aws";

interface State {
  isLoading: boolean;
  activityId?: number | string;
  accountType?: string;
  jobType?: string;
  magicTownFlag?: string;
  masterFlag?: string;
  qualityJob?: string;
  apptNumber?: string;
  aworkType?: string;
  solutionCode?: string;
  provisioningValidation?: string;
  clientSignature?: Blob | null;
  clientSignatureHandled?: Image | null;
  technicianSignature?: Blob | null;
  technicianSignatureHandled?: Image | null;
  clientSignatureResult?: { text: string, result: boolean, quality: number };
  technicianSignatureResult?: { text: string, result: boolean, quality: number };
  complexity: number;
  tcSectionVisibilitySettings: boolean;
  clientSignVisibilitySettings: boolean;
  othersVisibilitySettings: boolean;
  onlyFinishButtonVisibility: boolean;
  byPassClientSignature: number;
  resourceId?: string;
  parentResourceId?: string;
  childResources?: GetAResourceResponse[];
  selectedTechnicians: GetAResourceResponse[];
  requiredAdditionals: boolean;
}

const initialState = {
  isLoading: false,
  complexity: 1,
  clientSignatureResult: undefined,
  tcSectionVisibilitySettings: false,
  clientSignVisibilitySettings: false,
  othersVisibilitySettings: false,
  onlyFinishButtonVisibility: false,
  byPassClientSignature: 0,
  selectedTechnicians: [],
  requiredAdditionals: false,
};

@Injectable({
  providedIn: 'root',
})
export class Store extends ComponentStore<State> {
  constructor(
    private readonly ofs: OfsMessageService,
    private readonly ofsRestApiService: OfsRestApiService,
    /*private readonly imageAnalyzer: ImageAnalyzerService,*/
    private readonly dialog: DialogService
  ) {
    super(initialState);
    this.handleOpenMessage(this.ofs.openMessage$);
    this.ofs.ready();
  }

  // Selectors
  readonly vm$ = this.select((state) => state);

  //Updaters
  readonly setFromOfsMessage = this.updater((state, message: Message) => {
    return {
      ...state,
      activityId: message.activity.aid,
      accountType: message.activity.XA_ACCOUNTTYPE,
      jobType: message.activity.XA_JOBTYPE,
      magicTownFlag: message.activity.XA_MAGIC_TOWN_FLAG,
      masterFlag: message.activity.XA_MST_ACT,
      qualityJob: message.activity.XA_QUALITY_JOB,
      apptNumber: message.activity.appt_number,
      aworkType: message.activity.aworktype,
      solutionCode: message.activity.XA_SOLUTIONCODE,
      provisioningValidation: message.activity.XA_PROVISIONING_VALIDATION,
      byPassClientSignature: message.activity.XA_CLIENTSIGN_OVER === '1' ? 1 : 0,
      resourceId: message.resource.external_id,
      requiredAdditionalsFlag: message.activity.XA_CODI_FLAG_TEC_ADI === '1',
    };
  });
  readonly setRequiredAdditionals = this.updater<boolean>((state, requiredAdditionals) => {
    return {
      ...state,
      requiredAdditionals
    }
  });
  readonly setResourceChild = this.updater<GetAResourceResponse>((state, resource) => {
    return {
      ...state,
      parentResourceId: resource.parentResourceId,
    }
  });
  readonly setChildResources = this.updater<GetAResourceResponse[]>((state, childResources) => {
    return {
      ...state,
      childResources: childResources
    }
  });
  readonly setSelectedTechnicians = this.updater<GetAResourceResponse[]>((state, selectedTechnicians) => {
    return {
      ...state,
      selectedTechnicians
    }
  })
/*  readonly setClientSignature = this.updater<Blob>(
    (state, clientSignature) => ({
      ...state,
      clientSignature,
    }));
  readonly setClientSignatureHandled = this.updater<Image>(
    (state, clientSignatureHandled) => ({
      ...state,
      clientSignatureHandled,
    }));
  readonly setClientSignatureResult = this.updater<{text: string, result: boolean, quality: number} | undefined>(
    (state, clientSignatureResult) => ({
      ...state,
      clientSignatureResult,
    }));
  readonly setComplexity = this.updater((state, complexity: number) => ({
    ...state,
    complexity
  }));*/

  // Effects
  readonly handleOpenMessage = this.effect<Message>(($) =>
    $.pipe(
      tap(({securedData}) => {
        const {ofscRestClientId, ofscRestSecretId, urlOFSC, urlAWSTechnicians, userAWS, passAWS, urlAWSToken} = securedData;
        this.ofsRestApiService.setOfsUrl(urlOFSC);
        this.ofsRestApiService.setOfsCredentials({user: ofscRestClientId, pass: ofscRestSecretId});
        this.ofsRestApiService.setAWSCredentials({user: userAWS, pass: passAWS, awsUrlToken: urlAWSToken});
        this.ofsRestApiService.setAwsUrlTechnicians(urlAWSTechnicians);
      }),
      tap((message) => this.setFromOfsMessage(message)),
      filter((message) => {
        const alreadyProcessed = message.activity.XA_CODI_FLAG_TEC_ADI === '1';
        if (alreadyProcessed) {
          this.ofs.closeAndRedirect(Number(message.activity.aid));
        }
        return !alreadyProcessed;
      }),
/*      switchMap((message)=> {
        if(message.activity.XA_CODI_FLAG_TEC_ADI === '1'){
          this.ofs.closeAndRedirect(message.activity.aid);
          return EMPTY;
        }
        return Promise.resolve();
      }),*/
      switchMap(() => this.ofsRestApiService.getAResource(this.get().resourceId!)),
      tap(resource => this.setResourceChild(resource)),
      switchMap((resourcesChild) => this.ofsRestApiService.getChildResources(resourcesChild.parentResourceId)),
      tap((parentResourceData) => this.handleChildResources(parentResourceData)),
      switchMap(() => this.dialog.confirm("Técnicos adicionales", "¿Participaron más técnicos en la incidencia?")),
      tap((userConfirmed) => {
        if (!userConfirmed!) {
          this.ofs.closeAndRedirect(Number(this.get().activityId));
        }
        this.setRequiredAdditionals(userConfirmed!);
      }),
      filter((userConfirmed) => !!userConfirmed!),
    )
  );
  readonly sendTechnicians = this.effect($ => $.pipe(
    concatMap(() => this.dialog.confirm("Confirmar técnicos adicionales", `¿Estás seguro de confirmar ${this.get().selectedTechnicians.length} ${this.get().selectedTechnicians.length > 1 ? 'técnicos adicionales' : 'técnico adicional'} en la incidencia?`)),
    concatMap((result) => result! ? Promise.resolve() : EMPTY),
    switchMap(() => this.ofsRestApiService.getAwsToken()),
    tap((response) => response.status === 200 ? this.ofsRestApiService.setAwsToken(response.token) : this.dialog.error("Ocurrió un error al obtener el token")),
    map(() => this.handleTechniciansToSend()),
    concatMap((bodyParams) => this.ofsRestApiService.incidentSendAdditionalTech(bodyParams)),
    tap((response) => Number(response.status) === 200 ? this.dialog.success("Técnicos adicionales enviados correctamente") : this.dialog.error("Ocurrió un error al enviar los técnicos adicionales")),
    map(() => {
      const {selectedTechnicians} = this.get();
      return selectedTechnicians.map(technician => technician.name).join('\n');
    }),
    switchMap((technicians) => this.ofsRestApiService.updateAnActivity(Number(this.get().activityId!), {
      XA_CODI_FLAG_TEC_ADI: this.get().requiredAdditionals ? 1 : 0,
      XA_CODI_TEC_ADI: technicians
    })),
    tap(() => this.ofs.closeAndRedirect(Number(this.get().activityId!))),
  ));
/*  readonly processDrawnClientSignature = this.effect<Blob>((blob$) => blob$.pipe(
    tap(() => this.setClientSignatureResult(undefined)),
    tap((blob) => this.setClientSignature(blob)),
    switchMap((blob: Blob) => from(this.imageAnalyzer.getBinaryImage(blob))),
    tap((image: Image) => this.setClientSignatureHandled(image)),
    concatMap((image) => {
      const pixels = this.imageAnalyzer.extractPixels(image);
      const graph = this.imageAnalyzer.buildGraph(pixels);
      const complexity = this.imageAnalyzer.analyzeGraph(graph);
      this.setClientSignatureResult(complexity);
      return Promise.resolve(complexity);
    }),
  ));*/
  /*readonly submitDrawnSignatures = this.effect((blob$) => blob$.pipe(
    concatMap(() => {
      const {clientSignatureHandled, clientSignatureResult, activityId} = this.get();
      if (!clientSignatureResult!.result) {
        this.dialog.error('Firma del cliente no válida');
        return EMPTY;
      }
      return from(clientSignatureHandled!.toBlob('image/png')).pipe(
        concatMap(processedClientSignatureBlob => this.ofsRestApiService.setAFileProperty(activityId!.toString(), 'XA_CUSTOMER_SIGNATURE', processedClientSignatureBlob).pipe(
          catchError((error: HttpErrorResponse) => {
            this.dialog.error(`Error al enviar firma del cliente: ${error.message}`);
            return throwError(() => error);
          }))),
        concatMap(() => {
          const {activityId, clientSignatureResult} = this.get();
          return this.ofsRestApiService.updateAnActivity(Number(activityId), {XA_CLIENTSIGN_RATING: Number(clientSignatureResult!.quality)});
        })
      )
    }),
    tap({
      complete: () => {
        this.dialog.success('Firmas enviadas correctamente');
      }
    }),
    catchError(error => {
      console.log('Error en el proceso de envío de firmas', error);
      return EMPTY;
    }),
  ));*/

/*  readonly completeActivity = this.effect<SurveyData>($ => $.pipe(
    map((survey: SurveyData) => this.handleSurvey(survey)),
    concatMap((params) => Object.keys(params).length > 0 ? from(this.ofsRestApiService.updateAnActivity(Number(this.get().activityId), params)) : Promise.resolve()),
    delay(300),
    switchMap(() => this.ofsRestApiService.completeAnActivity(Number(this.get().activityId))),
  ));*/

  private handleChildResources(parentResourceData: GetChildResourcesResponse) {
    const {resourceId} = this.get();
    const resources = parentResourceData.items.filter(resource =>
      resource.resourceId !== resourceId
      && resource.resourceType === 'TEC'
      && resource.status === "active"
      && resource.workSchedules.items &&
      resource.workSchedules.items.some(workSchedule => workSchedule.isWorking));
    this.setChildResources(resources);
  }

  private handleTechniciansToSend(): tecnicosAdicionalesRequest {
    const {selectedTechnicians, apptNumber} = this.get();
    const technicians = selectedTechnicians.map(technician => {
      return {
        "idtecnico": technician.resourceId,
        "nombre": technician.name!
      }
    });
    return {
      "apptnumber": apptNumber!,
      "technician": technicians
    };
  }

/*  private handleSurvey(rawSurvey: SurveyData): UpdateAnActivityBodyParams {
    const params: Partial<UpdateAnActivityBodyParams> = {}
    if (rawSurvey.serviceConformityCtrl) {
      params.XA_STATUS_ORDER_SIEBEL = rawSurvey.serviceConformityCtrl
    }
    if (rawSurvey.satisfactionCtrl && rawSurvey.checkedServicesCtrl) {
      params.XA_QUALITY_JOB = rawSurvey.satisfactionCtrl;
      if (rawSurvey.checkedServicesCtrl.includes('Internet')) params.XA_SERV_INTERNET = 1;
      if (rawSurvey.checkedServicesCtrl.includes('Television')) params.XA_SERV_TV = 1;
      if (rawSurvey.checkedServicesCtrl.includes('Telefono')) params.XA_SERV_TEL = 1;
    }
    if (rawSurvey.othersCtrl) {
      params.XA_OTHER_COMMENTS = rawSurvey.othersCtrl;
    }
    return params;
  }*/

  public sendCloseMessage(additionalData: Partial<Message>) {
    this.ofs.close(additionalData);
  }
}
