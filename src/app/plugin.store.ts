import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { catchError, concatMap, delay, EMPTY, from, map, switchMap, tap, throwError } from 'rxjs';
import { OfsMessageService } from './services/ofs-message.service';
import { Message } from './types/models/message';
import { OfsRestApiService } from './services/ofs-rest-api.service';
import { ImageAnalyzerService } from './services/image-analyzer.service';
import Image from 'image-js';
import { DialogService } from "./services/dialog.service";
import { HttpErrorResponse } from "@angular/common/http";
import { SurveyData } from "./types/plugin-types";
import { UpdateAnActivityBodyParams } from "./types/ofs-rest-api";

interface State {
  activityId?: number | string;
  accountType?: string;
  jobType?: string;
  magicTownFlag?: string;
  masterFlag?: string;
  qualityJob?: string;
  apptNumber?: string;
  aworkType?: string;
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
  byPassClientSignature: number;
}

const initialState = {
  complexity: 1,
  clientSignatureResult: undefined,
  tcSectionVisibilitySettings: false,
  clientSignVisibilitySettings: false,
  othersVisibilitySettings: false,
  byPassClientSignature: 0
};

@Injectable({
  providedIn: 'root',
})
export class Store extends ComponentStore<State> {
  constructor(
    private readonly ofs: OfsMessageService,
    private readonly ofsRestApiService: OfsRestApiService,
    private readonly imageAnalyzer: ImageAnalyzerService,
    private readonly dialog: DialogService,
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
      byPassClientSignature: message.activity.XA_CLIENTSIGN_OVER === '1' ? 1 : 0
    };
  });
  readonly setClientSignature = this.updater<Blob>(
    (state, clientSignature) => ({
      ...state,
      clientSignature,
    }));
/*  readonly setTechnicianSignature = this.updater<Blob>(
    (state, technicianSignature) => ({
      ...state,
      technicianSignature,
    }));*/
/*  readonly setTechnicianSignatureHandled = this.updater<Image>(
    (state, technicianSignatureHandled) => ({
      ...state,
      technicianSignatureHandled,
    }));*/
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
/*  readonly setTechnicianSignatureResult = this.updater<{text: string, result: boolean, quality: number}>(
    (state, technicianSignatureResult) => ({
      ...state,
      technicianSignatureResult,
    }));*/
  readonly setComplexity = this.updater((state, complexity: number) => ({
    ...state,
    complexity
  }));
  readonly setTcSectionVisibilitySettings = this.updater((state, tcSectionVisibilitySettings: boolean) => ({
    ...state,
    tcSectionVisibilitySettings
  }));
  readonly setClientSignVisibilitySettings = this.updater((state, clientSignVisibilitySettings: boolean) => ({
    ...state,
    clientSignVisibilitySettings
  }));
  readonly setOthersVisibilitySettings = this.updater((state, othersVisibilitySettings: boolean) => ({
    ...state,
    othersVisibilitySettings
  }));

  // Effects
  private readonly handleOpenMessage = this.effect<Message>(($) =>
    $.pipe(
      tap((message) => {
        this.setFromOfsMessage(message);
      }),
      tap(({securedData}) => {
        const {ofscRestClientId, ofscRestSecretId, urlOFSC, parametroComplejidad} = securedData;
        const { byPassClientSignature } = this.get();
        this.ofsRestApiService.setUrl(urlOFSC);
        this.ofsRestApiService.setCredentials({user: ofscRestClientId, pass: ofscRestSecretId});
        const complexityGrade = byPassClientSignature === 1 ? 0 : Number(parametroComplejidad);
        this.setComplexity(complexityGrade);
        this.imageAnalyzer.setComplexityGrade(complexityGrade);
      }),
      concatMap(() => this.ofsRestApiService.getAnActivityType(this.get().aworkType!)),
      tap(({groupLabel}) => this.visibilitySettings(groupLabel!)),
    )
  );
  readonly processDrawnClientSignature = this.effect<Blob>((blob$) => blob$.pipe(
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
  ));
/*  readonly processDrawnTechSignature = this.effect<Blob>((blob$) => blob$.pipe(
    tap((blob) => this.setTechnicianSignature(blob)),
    switchMap((blob: Blob) => from(this.imageAnalyzer.getBinaryImage(blob))),
    tap((image: Image) => this.setTechnicianSignatureHandled(image)),
    concatMap((image) => {
      const pixels = this.imageAnalyzer.extractPixels(image);
      const graph = this.imageAnalyzer.buildGraph(pixels);
      const complexity = this.imageAnalyzer.analyzeGraph(graph);
      this.setTechnicianSignatureResult(complexity);
      return Promise.resolve(complexity);
    }),
  ));*/
  readonly submitDrawnSignatures = this.effect((blob$) => blob$.pipe(
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
  ));

  readonly completeActivity = this.effect<SurveyData>($ => $.pipe(
    map((survey: SurveyData) => this.handleSurvey(survey)),
    concatMap((params) => this.ofsRestApiService.updateAnActivity(Number(this.get().activityId), params)),
    delay(300),
    switchMap(() => this.ofsRestApiService.completeAnActivity(Number(this.get().activityId))),
    tap(() => this.ofs.close({}))
  ));


  private handleSurvey(rawSurvey: SurveyData): UpdateAnActivityBodyParams {
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
  }

  private visibilitySettings(aworkTypeGroup: string) {
    const {magicTownFlag, accountType, jobType} = this.get();
    let jobTypeSignCatalog = ['TC061','TC062','TC063','TC072','TC062','TC108','TC126','TC179','TC180','TC181','TC182','TC032','TC034','TC052','TC071','TC098','TC116','TC151','TC132','TC157','TC163','TC169', 'TC213','TC214','TC215','TC216'];
    let jobTypeOthersCatalog = ['TC061','TC062','TC063','TC072','TC062','TC108','TC126','TC179','TC180','TC181','TC182','TC032','TC034','TC052','TC071','TC098','TC116','TC151','TC132','TC157','TC163','TC169', 'TC213','TC214','TC215','TC216','TC224'];
    let aworkTypeGroupTCValidation = aworkTypeGroup.includes('GTC'); // activity.`aworktype_group` IN ('GTC')
    let magicTownTCValidation = magicTownFlag !== '1'; // NOT activity.`XA_MAGIC_TOWN_FLAG` IN ('1')
    let accountTypeValidation = accountType === 'Residencial'; // activity.`XA_ACCOUNTTYPE` IN ('Residencial')
    let tcSectionValidation = aworkTypeGroupTCValidation && magicTownTCValidation && accountTypeValidation;
    this.setTcSectionVisibilitySettings(tcSectionValidation);
    let jobTypeSignValidation = !jobTypeSignCatalog.includes(jobType!);
    let aworkTypeSignValidation = aworkTypeGroup.includes('customer') || aworkTypeGroup.includes('GTC');
    let clientSignatureVisibilitySettings = jobTypeSignValidation && aworkTypeSignValidation;
    this.setClientSignVisibilitySettings(clientSignatureVisibilitySettings);
    let aworkTypeOthersValidation = aworkTypeGroup.includes('customer');
    let jobTypeOthersValidation = !jobTypeOthersCatalog.includes(jobType!);
    let magicTownOthersValidation = magicTownFlag !== '1';
    let accountTypeOthersValidation = accountType === 'Residencial' || !accountType;
    let othersVisibilitySettings = aworkTypeOthersValidation && jobTypeOthersValidation && magicTownOthersValidation && accountTypeOthersValidation;
    this.setOthersVisibilitySettings(othersVisibilitySettings);
  }
}
