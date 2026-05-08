import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await resetPassword(token, password);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Password updated");
    window.location.href = "/"; // або login
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button>Reset</button>
    </form>
  );
}
