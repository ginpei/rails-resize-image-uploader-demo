interface Window {
  buildThriftyData: Function;
}
interface ISize {
  width: number;
  height: number;
}
interface IThriftyImage {
  name: string;
  filename: string;
  blob: Blob;
  originalSize: number;
}
