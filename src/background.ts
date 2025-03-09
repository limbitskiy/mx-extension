interface OurStorage {
  service: {};
  folders: {};
  tasks: {};
}

interface Item {
  discount: number;
  id: string;
  name: string;
  price: number;
  url: string;
}

interface Folder {
  discount: number;
  id: string;
  items: Item[];
  itemCnt: number;
  name: string;
  timer: string; // "16:25"
}

interface Task {
  id: number;
  period: number; // in seconds
  url: string;
  lastUpdated?: number;
}

const PARSING_INTERVAL = 300_000; // 5 mins
const UPDATE_CHECK_INTERVAL = 60000;

// do ext_read_tasks
// replace old tasks in storage

// works on every startup
console.log(`page reload at `, Date.now());

init();

async function init() {
  // set task update alarm
  await chrome.alarms.create("task-update", {
    // delayInMinutes: 1,
    periodInMinutes: UPDATE_CHECK_INTERVAL / 60000 / 2,
  });

  const { settings } = await chrome.storage.local.get("settings");

  if (!settings) {
    console.log(`first entry`);

    firstEntry();
  } else {
    console.log(`regular entry`);
  }

  getTasks();
}

async function getTasks() {
  const payload = {
    key: "ext_read_tasks",
  };

  await makeRequest(payload);
}

async function firstEntry() {
  const payload = {
    key: "ext_init",
    data: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser_language: navigator.language,
    },
  };

  const result = await makeRequest(payload);
  console.log("🚀 ~ firstEntry ~ result:", result);
}

async function makeRequest(requestBody: {}) {
  try {
    const response = await fetch("https://api-dev.tapsmart.io/main", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(requestBody),
    });

    const { service, data } = await response.json();

    if (service) {
      await chrome.storage.local.set({ service });
    }

    if (data.folders) {
      await chrome.storage.local.set({ folders: data.folders });
    }

    if (data.tasks) {
      await chrome.storage.local.set({ tasks: data.tasks });
    }

    return data;
  } catch (error) {
    console.error(error);
  }
}

async function updateTasks() {
  const { tasks } = (await chrome.storage.local.get("tasks")) as { tasks: Task[] };

  if (!tasks) return;

  tasks.forEach((task, index, array) => {
    console.log(task);

    if ("lastUpdated" in task) {
      if (task.lastUpdated! === 300) {
        updateSingleTask(task);
        array[index].lastUpdated = task.period;
      } else {
        task.lastUpdated! -= UPDATE_CHECK_INTERVAL / 1000;
      }
    } else {
      array[index].lastUpdated = task.period;
    }
  });

  await chrome.storage.local.set({ tasks });
}

async function updateSingleTask(task: Task) {
  console.log(`executing task`);

  const response = await fetch(task.url);
  const html = await response.text();

  const payload = {
    key: "ext_update_tasks",
    data: {
      taskId: task.id,
      url: task.url,
      html,
    },
  };

  const { status } = await makeRequest(payload);

  if (!status) {
    console.error(`Error when executing task`);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);

  const { action, payload } = request;

  if (action === "make_request") {
    makeRequest(payload)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error.message }));

    return true;
  }
});

// works on browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log(`browser startup`, Date.now());

  chrome.alarms.create("updateTasks", {
    periodInMinutes: 0.5,
  });
});

chrome.runtime.onInstalled.addListener(function () {
  console.log("installed startup", Date.now());
  chrome.alarms.create("updateTasks", {
    periodInMinutes: 0.5,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "task-update") {
    console.log("Updating sources..");
    updateTasks();
  }
});
