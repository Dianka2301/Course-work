import { useEffect, useState } from "react";
import {
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../api/recipes";

export default function Notifications({ onChanged }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setItems(data);
      onChanged?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    await markNotificationRead(id);
    load();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    load();
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead();
    load();
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    load();
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <img src="/images/notifications.svg" alt="" />
          <h2>Сповіщення</h2>
        </div>
        <div className="notifications-actions">
          <button onClick={handleReadAll}>Прочитати всі</button>
          <button onClick={handleDeleteAll}>Видалити всі</button>
        </div>
      </div>

      {loading ? (
        <p>Завантаження...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Нових сповіщень немає</h3>
          <p>Тут зʼявлятимуться статуси публікацій і важливі події.</p>
        </div>
      ) : (
        <div className="notifications-table-wrap">
          <table className="notifications-table">
            <thead>
              <tr>
                <th>Повідомлення</th>
                {/* <th>Дата</th> */}
                {/* <th>Статус</th> */}
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={item.is_read ? "" : "unread"}>
                  <td>{item.message}</td>
                  {/* <td>{new Date(item.created_at).toLocaleString("uk-UA")}</td> */}
                  {/* <td>{item.is_read ? "прочитано" : "нове"}</td> */}
                  <td>
                    {!item.is_read && (
                      <button onClick={() => handleRead(item.id)}>✔</button>
                    )}
                    <button onClick={() => handleDelete(item.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
