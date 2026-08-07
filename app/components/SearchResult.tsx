import type { SearchResult } from "~/types/SearchResult";
import { decodeRFC2047 } from "~/utils/decodeRFC2047";

type AutoRagFileAttribute = {
  title?: string;
  description?: string;
  image?: string;
};

function getFileAttribute(attrs: Record<string, unknown>): AutoRagFileAttribute | undefined {
  const file = attrs.file;
  if (file && typeof file === "object") {
    return file as AutoRagFileAttribute;
  }
  return undefined;
}

export default function SearchResult({ result }: { result: SearchResult }) {
  const file = getFileAttribute(result.attributes);
  const decodedTitle = file?.title ? decodeRFC2047(file.title) : "";
  const decodedDescription = file?.description ? decodeRFC2047(file.description) : "";

  return (
    <div
      className="flex justify-between gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="">
        <a href={result.filename} target="_blank" rel="noopener noreferrer">
          <h4 className="text-xl font-medium text-violet-900">
            {decodedTitle}
          </h4>
        </a>
        <p className="text-sm text-gray-600 mt-1">
          {decodedDescription}
        </p>
      </div>

      {file?.image && (
        <img
          src={file.image}
          alt={decodedTitle || result.filename}
          className="rounded w-40 h-40 object-cover"
        />
      )}
    </div>
  );
}
