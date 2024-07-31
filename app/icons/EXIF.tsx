import FocalIcon from "~/icons/Focal";
import ISOIcon from "~/icons/ISO";
import ShutterIcon from "~/icons/Shutter";
import ApertureIcon from "~/icons/Aperture";
import {CameraIcon, VideoCameraIcon} from "@heroicons/react/24/outline";


export interface EXIFProps {
  Make: string,
  Model: string,
  LensModel: string,
  FNumber: string,
  ExposureTime: string,
  ISO: string,
  FocalLength: string
  [key: string]: string
}

// 将0.00125的曝光时间转换成常用的快门速度
function shutterSpeed (exposureTime: string) {
  if (!exposureTime) return undefined;
  const time = parseFloat(exposureTime);
  if (time >= 1) {
    // 保留整数部分
    return `${Math.round(time)}`;
  }
  const fraction = Math.round(1 / time);
  return `1/${fraction}`;
}

export default function EXIF ({exif}: { exif: EXIFProps }) {
  return (
      <div className="grid grid-cols-2 md:grid-cols-3 text-sm gap-4">
        <div className="flex justify-start gap-2 items-center">
          <CameraIcon className="h-5 w-5" />
          <p>{exif.Make} {exif.Model}</p>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <ApertureIcon />
          <p>ƒ{exif.FNumber}</p>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <ShutterIcon />
          <p>{shutterSpeed(exif.ExposureTime)}</p>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <VideoCameraIcon className="h-5 w-5" />
          <p>{exif.LensModel}</p>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <ISOIcon />
          <p>{exif.ISO}</p>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <FocalIcon />
          <p>{exif.FocalLength}</p>
        </div>
      </div>
  )
}
