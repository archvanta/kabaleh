// Keep the exact approved characters while making typed emoticons read left to right in RTL prose.
export function CopyText({ text }: { text: string }) {
  return (
    <>
      {text.replace(/\s+(:\){1,3})/g, "\u00a0$1").split(/(:\){1,3})/g).map((piece, i) =>
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
