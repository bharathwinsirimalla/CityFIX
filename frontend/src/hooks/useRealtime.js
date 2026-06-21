import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket } from "../lib/socket";
import { fetchNotifications, prependNotification } from "../features/notifications/notificationsSlice";
import {
  fetchAssignedComplaints,
  fetchComplaintById,
  fetchMyComplaints
} from "../features/complaints/complaintsSlice";

export const useRealtime = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!token || !user?.id) return;
    const socket = connectSocket(token);
    if (!socket) return;
    dispatch(fetchNotifications());

    const refreshComplaint = (payload) => {
      if (payload?.complaintId) {
        dispatch(fetchComplaintById(payload.complaintId));
      }
      if (user.role === "citizen") {
        dispatch(fetchMyComplaints());
      }
      if (user.role === "officer") {
        dispatch(fetchAssignedComplaints());
      }
    };

    const onNotificationCreated = ({ notification }) => {
      if (notification) {
        dispatch(prependNotification(notification));
      } else {
        dispatch(fetchNotifications());
      }
    };

    const onConnectError = (err) => {
      console.error("Realtime connection failed:", err.message);
    };

    socket.on("complaintStatusUpdated", refreshComplaint);
    socket.on("complaintAssigned", refreshComplaint);
    socket.on("complaintCreated", refreshComplaint);
    socket.on("notificationCreated", onNotificationCreated);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("complaintStatusUpdated", refreshComplaint);
      socket.off("complaintAssigned", refreshComplaint);
      socket.off("complaintCreated", refreshComplaint);
      socket.off("notificationCreated", onNotificationCreated);
      socket.off("connect_error", onConnectError);
    };
  }, [dispatch, token, user?.id, user?.role]);
};

