// Initialize button with user's preferred color
const startButton = document.getElementById("startButton");

// When the button is clicked, inject setPageBackgroundColor into current page
startButton.addEventListener("click", async () => {
  console.log("clicked!");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.desktopCapture.chooseDesktopMedia(["window"], tab, (streamId) => {
    console.log("started desktopCapture OK");
    //check whether the user canceled the request or not
    if (streamId && streamId.length) {
    }
  });

  // chrome.scripting.executeScript({
  //   target: { tabId: tab.id },
  //   function: startCapture,
  // });
});

// The body of this function will be executed as a content script inside the
// current page
function startCapture() {
  console.log("startCapture");
}
