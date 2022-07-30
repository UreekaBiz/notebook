import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from '@ureeka-notebook/web-service';

// ********************************************************************************
// check whether the dimensions of HTMLImageElement are within the boundaries of
// what is appropriate to insert into the Document, or if the image must be resized
// while maintaining the aspect ratio
export const fitImageDimension = (imageNode: HTMLImageElement) => {
  const { src, width, height } = imageNode;

  if(width < MAX_IMAGE_WIDTH && height < MAX_IMAGE_HEIGHT) {
    return {
      src,
      fittedWidth: width.toString() + 'px'/*default units*/,
      fittedHeight: height.toString() + 'px'/*default units*/,
    };
  } /* else -- image exceeds limits and must be resized while maintaining ratio */

  const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height),
        newWidth = Math.floor(ratio * width),
        newHeight = Math.floor(ratio * height);

  return {
    src,
    fittedWidth: newWidth.toString() + 'px'/*default units*/,
    fittedHeight: newHeight.toString() + 'px'/*default units*/,
  };
};

// creates a new HTMLImageElement and waits for it to load before returning it so
// that its naturalWidth and naturalHeight properties can be used to set the correct
// dimension for the Image Node
export const getImageMeta = (url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
          img.src = url;
          img.onload = () => resolve(img);
          img.onerror = () => reject();
  });
};
