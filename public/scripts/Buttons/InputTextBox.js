export default class TextInput {
  constructor() {
    // No longer need socket in constructor
  }

  showJoinRoomInput() {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.placeholder = "Enter room code";
    inputElement.maxLength = 6;
    inputElement.autocomplete = "off";

    inputElement.style.position = "absolute";
    inputElement.style.left = "50%";
    inputElement.style.top = "65%";
    inputElement.style.transform = "translate(-50%, -50%)";

    const styles = {
      backgroundColor: "#222",
      color: "#fff",
      border: "2px solid #4CAF50",
      borderRadius: "10px",
      padding: "10px 15px",
      fontSize: "20px",
      textAlign: "center",
      width: "250px",
      outline: "none",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
      transition: "border-color 0.3s ease",
    };

    Object.assign(inputElement.style, styles);

    inputElement.addEventListener("focus", function () {
      this.style.borderColor = "#ffcc00";
      this.style.boxShadow = "0 2px 15px rgba(255, 204, 0, 0.3)";
    });

    inputElement.addEventListener("blur", function () {
      this.style.borderColor = "#4CAF50";
      this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
    });

    const gameCanvas = document.getElementById("gameCanvas");
    gameCanvas.appendChild(inputElement);
    inputElement.focus();

    return inputElement;
  }

  showCreateRoomInput() {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.placeholder = "Choose room code";
    inputElement.maxLength = 6;
    inputElement.autocomplete = "off";

    inputElement.style.position = "absolute";
    inputElement.style.left = "50%";
    inputElement.style.top = "85%";
    inputElement.style.transform = "translate(-50%, -50%)";

    const styles = {
      backgroundColor: "#222",
      color: "#fff",
      border: "2px solid #4CAF50",
      borderRadius: "10px",
      padding: "10px 15px",
      fontSize: "20px",
      textAlign: "center",
      width: "250px",
      outline: "none",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
      transition: "border-color 0.3s ease",
    };

    Object.assign(inputElement.style, styles);

    inputElement.addEventListener("focus", function () {
      this.style.borderColor = "#ffcc00";
      this.style.boxShadow = "0 2px 15px rgba(255, 204, 0, 0.3)";
    });

    inputElement.addEventListener("blur", function () {
      this.style.borderColor = "#4CAF50";
      this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
    });

    const gameCanvas = document.getElementById("gameCanvas");
    gameCanvas.appendChild(inputElement);
    inputElement.focus();

    return inputElement;
  }
}