function openSection(section) {
  const payload = {
    type: "open_section",
    section: section,
    time: Date.now()
  };

  if (tg) {
    tg.sendData(JSON.stringify(payload));
    tg.showAlert("Открыт раздел: " + section);
  } else {
    console.log("OPEN:", section);
  }
}
