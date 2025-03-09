interface Path {
  classList: string[] | null;
  id: string | null;
  tagName: string | null;
  index: number | null;
}

export function getCurrentSelection() {
  if (!window.getSelection) return;

  const selection = window.getSelection();

  if (selection?.type !== "Range") {
    alert(`Please select product price or name `);
    return;
  }

  // @ts-ignore
  return window.getSelection().anchorNode?.parentElement;
}

export function constructPathObject(el: HTMLElement, path: Path[], counter = 3) {
  if (counter <= 0) {
    return path;
  }

  const elParams = {
    classList: <string[] | null>null,
    id: <string | null>null,
    tagName: <string | null>null,
    index: <number | null>null,
  };

  if (el.classList.length) {
    // @ts-ignore
    elParams.classList = [...el.classList];
  }

  if (el.id) {
    elParams.id = el.id;
  }

  if (el.tagName) {
    elParams.tagName = el.tagName.toLowerCase();
  }
  // @ts-ignore
  elParams.index = [...el.parentElement!.children].indexOf(el);

  path.unshift(elParams);

  return constructPathObject(el.parentElement!, path, counter - 1);
}

export function constructQueryString(path: Path[]) {
  let queryString = "";

  path.forEach((item, index, array) => {
    queryString += item.tagName;

    if (item.id) {
      queryString += `#${item.id}`;
    } else if (item.classList?.length) {
      queryString += `.${item.classList.join(".")}`;
    } else if (item.index) {
      queryString += `:nth-child(${item.index + 1})`;
    } else {
      console.error(`Cannot construct query string. Did not find class, id or index`);
    }

    if (index !== array.length - 1) {
      queryString += ">";
    }
  });

  return queryString;
}
