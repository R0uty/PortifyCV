// One plain line per value, for an ATS layout: see src/utils/atsDetails.js.
export function AtsDetails({ lines }) {
  return lines.map((line) => (
    <p key={line} className="mt-1 text-xs text-gray-600">{line}</p>
  ))
}
