import PropTypes from "prop-types";
import "./Toast.css";

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string,
};

export default Toast;
