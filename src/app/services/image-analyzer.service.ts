import { Injectable, OnInit } from '@angular/core';
import { Image } from 'image-js';
// import * as cv from '@techstark/opencv-js';
import Graph from 'graphology';

@Injectable({
  providedIn: 'root'
})
export class ImageAnalyzerService {

  // cvCharged = false;
  // buildInfo = '';

  constructor() {
    // setTimeout(() => {
    //   (window as any).cv = cv;
    //   this.buildInfo = cv.getBuildInformation();
    //   console.log(this.buildInfo);
    // }, 1000);
  }

  // waitForCV(): Promise<void> {
  //   return new Promise((resolve) => {
  //     const checkCV = () => {
  //       if (cv && cv.Mat) {
  //         this.cvCharged = true;
  //         resolve();
  //       } 
  //       else {
  //         setTimeout(checkCV, 500);
  //       }
  //     };
  //     checkCV();
  //   });
  // }

  async getBinaryImage(blob: Blob): Promise<Image> {
    const img = await Image.load(URL.createObjectURL(blob));
    const handledImage = img.grey().resize({ width: 200 }); // Optimization size
    const binary = new Image(handledImage.width, handledImage.height);
    for (let y = 0; y < handledImage.height; y++) {
      for (let x = 0; x < handledImage.width; x++) {
        const pixelValue = handledImage.getPixelXY(x, y)[0];
        binary.setPixelXY(x, y, pixelValue < 128 ? [0] : [255]); // Black: 0 | White: 255
      };
    };
    return binary;
  }

  extractPixels(binaryImage: Image): number[][] {
    const pixels: number[][] = [];
    for (let y = 0; y < binaryImage.height; y++) {
      for (let x = 0; x < binaryImage.width; x++) {
        const pixelValue = binaryImage.getPixelXY(x, y)[0];
        if (pixelValue === 0) {
          pixels.push([x, y]); // Only black pixels in the array
        }
      }
    }
    return pixels;
  }

  buildGraph(pixels: number[][]): Graph {
    const graph = new Graph();
    pixels.forEach(([x, y]) => { // From the black pixels, add nodes
      const id = `${x},${y}`;
      graph.addNode(id, { x, y });
    });

    pixels.forEach(([x, y]) => { // Chech if the current pixel has black pixels around
      const id = `${x},${y}`;
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        [x - 1, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x + 1, y - 1]
      ];
      neighbors.forEach(([nx, ny]) => {
        const neighborId = `${nx},${ny}`;
        if (graph.hasNode(neighborId) && !graph.hasEdge(id, neighborId)) {
          graph.addEdge(id, neighborId);
        }
      });
    });
    return graph;
  }

  analyzeGraph(graph: Graph): string {
    let intersectionCount = 0;
    graph.forEachNode((node) => {
      const neighbors = graph.degree(node);
      // console.log(neighbors);
      if (neighbors > 3) {
        intersectionCount++;
      }
    });
    // console.log(intersectionCount);
    return intersectionCount > 100 ? 'Complejo' : 'Sencillo';
  }

  // createImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  //   return new Promise((resolve, reject) => {
  //     const img = new Image();
  //     img.onload = () => {
  //       resolve(img);
  //     };
  //     img.onerror = (error) => reject(error);
  //     img.src = URL.createObjectURL(blob);
  //   });
  // }

  // processedImage(img: HTMLImageElement): cv.Mat {
  //   // if (!this.cvCharged) {
  //   //   this.waitForCV();
  //   // }
  //   const src = cv.imread(img);
  //   console.log(src);
  //   const gray = new cv.Mat();
  //   console.log(gray);
  //   const binary = new cv.Mat();

  //   // cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  //   // cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
  //   // cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

  //   const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
  //   cv.erode(binary, binary, kernel, new cv.Point(-1, -1), 1);
  //   cv.dilate(binary, binary, kernel, new cv.Point(-1, -1), 1);

  //   src.delete();
  //   // gray.delete();
  //   kernel.delete();

  //   return binary;
  // }

  blobToUint8Array(imageBlob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const uint8array = new Uint8Array(arrayBuffer);
        resolve(uint8array);
      };

      reader.onerror = (error) => {
        reject(error)
      };

      reader.readAsArrayBuffer(imageBlob);
    })
  };

  // async handleImageTest(imageArray: Uint8Array, imageName: string) {
  //   try {
  //     const image = await Image.load(imageArray);
  //     const resizedImage = image.resize({width: 720, height: 720});
  //     // const imageStatistic = resizedImage.getHistogram();
  //     // console.log(imageStatistic);
  //     // const imageGrey = resizedImage.grey();
  //     const imageBuffer = resizedImage.toBuffer();
  //     return new Uint8Array(imageBuffer);
  //   }
  //   catch (error) {
  //     throw error;
  //   }
  // };

  // async analizarTrazo(imageArray: Uint8Array) {
  //   console.log(imageArray);
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const image = cv.matFromImageData(
  //         new ImageData(new Uint8ClampedArray(imageArray), 400)
  //       );
  //       const grey = new cv.Mat();
  //       cv.cvtColor(image, grey, cv.COLOR_RGB2GRAY);

  //       const edges = new cv.Mat();
  //       cv.Canny(grey, edges, 50, 150);

  //       const contours = new cv.MatVector();
  //       const hierarchy = new cv.Mat();
  //       cv.findContours(
  //         edges,
  //         contours,
  //         hierarchy,
  //         cv.RETR_EXTERNAL,
  //         cv.CHAIN_APPROX_SIMPLE
  //       );

  //       const trazos = [];

  //       for (let i = 0; i < contours.size(); ++i) {
  //         const contour = contours.get(i);
  //         const area = cv.contourArea(contour);
  //         const perimeter = cv.arcLength(contour, true);
  //         trazos.push({
  //           area,
  //           perimeter
  //         });
  //         if (area > 1000 && perimeter > 500) {
  //           console.log('Trazo complejo');
  //         } else {
  //           console.log('Trazo simple');
  //         }
  //       }

  //       image.delete();
  //       grey.delete();
  //       edges.delete();
  //       contours.delete();
  //       hierarchy.delete();

  //       resolve(trazos);
  //     }
  //     catch (error) {
  //       reject(error);
  //     }
  //   })
  //   // return new Promise((resolve, reject) => {
  //   // cv.onRuntimeInitialized = () => {
  //   //   try {
  //   //     const image = cv.matFromImageData(
  //   //       new ImageData(new Uint8ClampedArray(imageArray), 400)
  //   //     );
  //   //     const grey = new cv.Mat();
  //   //     cv.cvtColor(image, grey, cv.COLOR_RGB2GRAY);

  //   //     const edges = new cv.Mat();
  //   //     cv.Canny(grey, edges, 50, 150);

  //   //     const contours = new cv.MatVector();
  //   //     const hierarchy = new cv.Mat();
  //   //     cv.findContours(
  //   //       edges, 
  //   //       contours,
  //   //       hierarchy,
  //   //       cv.RETR_EXTERNAL,
  //   //       cv.CHAIN_APPROX_SIMPLE
  //   //     );

  //   //     const trazos = [];

  //   //     for(let i = 0; i < contours.size(); ++i) {
  //   //       const contour = contours.get(i);
  //   //       const area = cv.contourArea(contour);
  //   //       const perimeter = cv.arcLength(contour, true);
  //   //       trazos.push({
  //   //         area, 
  //   //         perimeter
  //   //       });
  //   //       if (area > 1000 && perimeter > 500) {
  //   //         console.log('Trazo complejo');
  //   //       } else {
  //   //         console.log('Trazo simple');
  //   //       }
  //   //     }

  //   //     image.delete();
  //   //     grey.delete();
  //   //     edges.delete();
  //   //     contours.delete();
  //   //     hierarchy.delete();

  //   //     resolve(trazos);
  //   //   }
  //   //   catch(error) {
  //   //     reject(error);
  //   //   }
  //   // }
  //   // })
  // }
}
