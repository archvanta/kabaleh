// Keep the exact approved characters while making typed emoticons read left to right in RTL prose.
export function CopyText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(:\){1,3})/g).map((piece, i) =>
        /^:\){1,3}$/.test(piece) ? (
          <bdi dir="ltr" key={i}>
            {piece}
          </bdi>
        ) : (
          piece
        ),
      )}
    </>
  );
}
