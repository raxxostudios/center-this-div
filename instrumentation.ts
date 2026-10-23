export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { dropEmudhraRoots } = await import('./lib/emudhra-guard');
    console.log(`[emudhra-guard] node ${process.version}: ${dropEmudhraRoots()} roots dropped`);
  }
}
