import React from 'react';

function AlertList({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-list">
        <h3>최근 알림</h3>
        <p className="no-alerts">알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="alert-list">
      <h3>최근 알림</h3>
      <ul>
        {alerts.map((alert, index) => (
          <li key={index} className={`alert-item ${alert.type}`}>
            <span className="alert-icon">
              {alert.type === 'warning' ? '⚠️' : '🚨'}
            </span>
            <div className="alert-content">
              <strong>{alert.title}</strong>
              <p>{alert.message}</p>
              <small>{alert.time}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlertList;
