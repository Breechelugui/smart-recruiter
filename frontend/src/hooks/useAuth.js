import { useAppSelector } from "../app/hooks";

export default function useAuth() {
  return useAppSelector((state) => state.auth);
}
