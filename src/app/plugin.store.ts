import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, concatMap, from, switchMap, tap } from 'rxjs';
import { OfsMessageService } from './services/ofs-message.service';
import { Message } from './types/models/message';
import { OfsRestApiService } from './services/ofs-rest-api.service';
import { ImageAnalyzerService } from './services/image-analyzer.service';
import Image from 'image-js';

interface State {
  activityId: number | string;
  clientSignature?: Blob | null;
  clientSignatureHandled?: Image | null;
  technitianSignature?: Blob | null;
  technitianSignatureHandled?: Image | null;
};

const initialState = {
  activityId: '5844',
};

@Injectable({
  providedIn: 'root',
})
export class Store extends ComponentStore<State> {
  constructor(
    // private readonly router: Router,
    private readonly ofs: OfsMessageService,
    private readonly ofsRestApiService: OfsRestApiService,
    private readonly imageAnalyzer: ImageAnalyzerService
  ) {
    super(initialState);
    this.handleOpenMessage(this.ofs.message);
    this.ofs.ready();
    // this.loadGlobalProps();
  }

  // Selectors
  readonly vm$ = this.select((state) => state);

  readonly ofsProperties = this.select(
    ({ activityId }) => ({
      activityId
    })
  );

  //Updaters
  readonly setFromOfsMessage = this.updater((state, message: Message) => {
    return {
      ...state,
      activityId: message.activity.aid,
    };
  });

  readonly setClientSignature = this.updater<Blob>(
    (state, clientSignature) => ({
      ...state,
      clientSignature,
    }));

  readonly setTechnitianSignature = this.updater<Blob>(
    (state, technitianSignature) => ({
      ...state,
      technitianSignature,
    }));

  readonly setTechnitianSignatureHandled = this.updater<Image>(
    (state, technitianSignatureHandled) => ({
      ...state,
      technitianSignatureHandled,
    }));

  readonly setClientSignatureHandled = this.updater<Image>(
    (state, clientSignatureHandled) => ({
      ...state,
      clientSignatureHandled,
    }));

  // Effects
  private readonly handleOpenMessage = this.effect<Message>(($) =>
    $.pipe(
      // tap((message) => this.setFromOfsMessage(message)),
      tap(() => {
        this.ofsRestApiService.setUrl('https://izzifso20202.test.fs.ocs.oraclecloud.com');
        this.ofsRestApiService.setCredentials({ user: '8a3ec2b3641593a3925e6490bc284dae68f09936@izzifso20202.test', pass: 'd1c4455e13868e49287228038dab394391274a32f880f15234a6a9213256' });
      }),
      // tap(({securedData}) => {
      //   const {ofscRestClientId, ofscRestSecretId, urlOFSC} = securedData;
      //   this.ofsRestApiService.setUrl(urlOFSC);
      //   this.ofsRestApiService.setCredentials({user: ofscRestClientId, pass: ofscRestSecretId})
      //   console.log(securedData);
      // })
      // map(({securedData}) => {
      //   const {urlOFSC} = securedData;
      //   console.log(urlOFSC);
      // })
      // map(({securedData}) => {
      //   const {} = securedData;
      // })
    )
  )

  readonly loadGlobalProps = this.effect(($) =>
    $.pipe(
      concatMap(() => this.ofsProperties),
    )
  );

  // Effects
  readonly getClientSignature = this.effect(($) => $.pipe(
    concatMap(() => this.ofsRestApiService.getAFileProperty({ activityId: this.get().activityId.toString(), propertyLabel: 'XA_CUSTOMER_SIGNATURE' })),
    tap((image: Blob) => this.setClientSignature(image)),
    switchMap((image: Blob) => from(this.imageAnalyzer.getBinaryImage(image))),
    tap((image: Image) => this.setClientSignatureHandled(image)),
    tap((image) => {
      const pixels = this.imageAnalyzer.extractPixels(image);
      const graph = this.imageAnalyzer.buildGraph(pixels);
      const complexity = this.imageAnalyzer.analyzeGraph(graph);
      console.log(`El trazo es: ${complexity} en Cliente`)
    }),
    //
    // switchMap((pixels) => this.imageAnalyzer.buildGraph(pixels))
    // switchMap((image) => this.imageAnalyzer.createImageFromBlob(image)),
    // tap((image) => this.imageAnalyzer.createImageFromBlob(image).then((img: HTMLImageElement) => {
    //   const processedMat = this.imageAnalyzer.processedImage(img);
    //   console.log(processedMat.data);
    // }))
    // concatMap((image: Blob) => from(this.imageAnalyzer.blobToUint8Array(image))),
    // tap((result) => console.log(result))
    // switchMap((result) => from(this.imageAnalyzer.handleImageTest(result, 'client'))),
    // tap((handledImage) => console.log(handledImage)),
    // tap((result) => this.imageAnalyzer.analizarTrazoTest(result))
  ));

  readonly getTechnitianSignature = this.effect(($) => $.pipe(
    concatMap(() => this.ofsRestApiService.getAFileProperty({ activityId: this.get().activityId.toString(), propertyLabel: 'XA_TECH_SIGNATURE' })),
    tap((image: Blob) => this.setTechnitianSignature(image)),
    switchMap((image: Blob) => from(this.imageAnalyzer.getBinaryImage(image))),
    tap((image) => this.setTechnitianSignatureHandled(image)),
    tap((image) => {
      const pixels = this.imageAnalyzer.extractPixels(image);
      const graph = this.imageAnalyzer.buildGraph(pixels);
      const complexity = this.imageAnalyzer.analyzeGraph(graph);
      console.log(`El trazo es: ${complexity} en Técnico`)
    }),
    //
    // tap(() => console.log(this.ofsRestApiService.baseUrl))
    // concatMap((image: Blob) => from(this.imageAnalyzer.blobToUint8Array(image))),
    // tap((result) => console.log(result)),
    // switchMap((result) => from(this.imageAnalyzer.handleImageTest(result, 'tech'))),
    // tap((handledImage) => console.log(handledImage)),
    // concatMap((result) => from(this.imageAnalyzer.analizarTrazo(result))),
    // tap((result) => this.imageAnalyzer.analizarTrazoTest(result))
    // tap((result) => {
    //   // console.log(result);
    //   // const uintarray = new Uint8Array(result);
    //   const imageBlob = new Blob([new Uint8Array(result)], {type: 'image/png'});
    //   this.setTechnitianSignatureHandled(imageBlob);
    // }),
  ));

  readonly close = this.effect(($) => $.pipe(tap((_) => this.ofs.close())));
}
