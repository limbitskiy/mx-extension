export default defineContentScript({
  // Set "registration" to runtime so this file isn't listed in manifest
  registration: "runtime",
  // Use an empty array for matches to prevent any host_permissions be added
  //  when using `registration: "runtime"`.
  matches: [],
  // Put the CSS in the shadow root
  cssInjectionMode: "ui",

  async main(ctx) {
    console.log("Content script executed!");

    //   const ui = await createUi(ctx);
    //   ui.mount();

    //   // Optionally, return a value to the background
    //   return "Hello world!";
  },
});

// export default defineUnlistedScript(() => {
//   console.log("Script was executed!");
//   // Executed when script is loaded
// });
