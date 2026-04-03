export async function GET() {
  return Response.json(
    {
      status: 418,
      error: "I'm a teapot",
      message: "I refuse to center your div. I am, permanently, a teapot.",
      hint: "The success threshold is 0.0001px. You will never make it. Neither will I. I am a teapot.",
    },
    { status: 418 }
  );
}
