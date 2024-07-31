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

export default function EXIF ({exif}: { exif: EXIFProps }) {
  return (
      <div className="grid grid-cols-2 md:grid-cols-3">
        <div>
          <CameraIcon className="h-5 w-5" />
          <p>{exif.Make} {exif.Model}</p>
        </div>
        <div>
          <VideoCameraIcon className="h-5 w-5" />
          <p>{exif.LensModel}</p>
        </div>
        <div>
          <ApertureIcon />
          <p>{exif.FNumber}</p>
        </div>
        <div>
          <ShutterIcon />
          <p>{exif.ExposureTime}</p>
        </div>
        <div>
          <ISOIcon />
          <p>{exif.ISO}</p>
        </div>
        <div>
          <FocalIcon />
          <p>{exif.FocalLength}</p>
        </div>
      </div>
  )
}
