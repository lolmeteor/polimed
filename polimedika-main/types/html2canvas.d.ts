declare module 'html2canvas' {
  interface Options {
    scale?: number
    backgroundColor?: string
    logging?: boolean
    useCORS?: boolean
    allowTaint?: boolean
  }

  interface Html2Canvas {
    (element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>
  }

  const html2canvas: Html2Canvas
  export default html2canvas
} 