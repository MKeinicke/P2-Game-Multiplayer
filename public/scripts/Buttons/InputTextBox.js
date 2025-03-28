
export default class TextInput {
  constructor(socket) {
    // Connect to the server
    this.socket = socket;

    // Set up socket event listeners
    if (this.socket) {
      this.setupSocketListeners();
    }
  }

  setupSocketListeners() {
    this.socket.on('room-join-response', (response) => {
      if (!response.success) {
        console.error('Failed to join room:', response.message);
        // Remove the alert, let MenuScene handle the error display
      }
    });
  
    this.socket.on('room-create-response', (response) => {
      if (!response.success) {
        console.error('Failed to create room:', response.message);
        // Remove the alert, let MenuScene handle the error display
      }
    });
  }
  
  showJoinRoomInput() {
    // Create input element
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.placeholder = "Enter room code"; // Added placeholder for better UX
    inputElement.maxLength = 6; // Assuming room codes are 6 characters
    inputElement.autocomplete = "off"; // Prevent browser suggestions

    // Position - centered horizontally, slightly below middle vertically
    inputElement.style.position = "absolute";
    inputElement.style.left = "50%";
    inputElement.style.top = "53.5%";
    inputElement.style.transform = "translate(-50%, -50%)";

    // Styling
    const styles = {
      backgroundColor: "#222",
      color: "#fff",
      border: "2px solid #4CAF50",
      borderRadius: "10px",
      padding: "10px 15px", // More horizontal padding
      fontSize: "20px",
      textAlign: "center",
      width: "250px", // Slightly wider for better readability
      outline: "none",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)", // Added subtle shadow
      transition: "border-color 0.3s ease", // Smooth transition for focus effect
    };

    // Apply styles
    Object.assign(inputElement.style, styles);

    // Focus effects
    inputElement.addEventListener("focus", function () {
      this.style.borderColor = "#ffcc00";
      this.style.boxShadow = "0 2px 15px rgba(255, 204, 0, 0.3)";
    });

    inputElement.addEventListener("blur", function () {
      this.style.borderColor = "#4CAF50";
      this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
    });

    // Handle Enter key press
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const roomCode = inputElement.value.trim();
        this.joinRoom(roomCode);
        inputElement.remove();
      }
    });

    // Add to DOM
    document.body.appendChild(inputElement);

    // Auto-focus the input for better UX
    inputElement.focus();

    // Return the element in case you need to reference it later
    return inputElement;
  }

  showCreateRoomInput() {
    // Create input element
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.placeholder = "Choose room code"; // Added placeholder for better UX
    inputElement.maxLength = 6; // Assuming room codes are 6 characters
    inputElement.autocomplete = "off"; // Prevent browser suggestions

    // Position - centered horizontally, slightly below middle vertically
    inputElement.style.position = "fixed";
    inputElement.style.left = "50%";
    inputElement.style.top = "70.5%";
    inputElement.style.transform = "translate(-50%, -50%)";

    // Styling
    const styles = {
      backgroundColor: "#222",
      color: "#fff",
      border: "2px solid #4CAF50",
      borderRadius: "10px",
      padding: "10px 15px", // More horizontal padding
      fontSize: "20px",
      textAlign: "center",
      width: "250px", // Slightly wider for better readability
      outline: "none",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)", // Added subtle shadow
      transition: "border-color 0.3s ease", // Smooth transition for focus effect
    };

    // Apply styles
    Object.assign(inputElement.style, styles);

    // Focus effects
    inputElement.addEventListener("focus", function () {
      this.style.borderColor = "#ffcc00";
      this.style.boxShadow = "0 2px 15px rgba(255, 204, 0, 0.3)";
    });

    inputElement.addEventListener("blur", function () {
      this.style.borderColor = "#4CAF50";
      this.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
    });

    // Handle Enter key press
    inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const roomCode = inputElement.value.trim();
        this.createRoom(roomCode);
        inputElement.remove();
      }
    });

    // Add to DOM
    document.body.appendChild(inputElement);

    // Auto-focus the input for better UX
    inputElement.focus();

    // Return the element in case you need to reference it later
    return inputElement;
  }


  joinRoom(roomCode) {
    // Validate room code
    if (!roomCode || roomCode.length !== 6) {
      alert('Room code must be 6 characters long');
      return;
    }

    // Send join room request to server
    this.socket.emit('join-room', { roomCode });
  }

  createRoom(roomCode) {
    // Validate room code
    if (!roomCode || roomCode.length !== 6) {
      alert('Room code must be 6 characters long');
      return;
    }

    // Send create room request to server
    this.socket.emit('create-room', { roomCode });
  }
}
