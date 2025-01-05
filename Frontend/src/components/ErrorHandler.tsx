import Swal from "sweetalert2";

function ErrorHandler(error: string) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: error,
    confirmButtonColor: "#3085d6",
  });

  return null;
}

export default ErrorHandler;