export default function ContentContainer({content}: {content: object}) {
  return (
      <div>{JSON.stringify(content)}</div>
  )
}
