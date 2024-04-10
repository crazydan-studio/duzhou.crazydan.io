import React from 'react';
import clsx from 'clsx';

import i18n from './i18n';
import styles from './styles.module.css';

export function Tasks({ children, status }) {
  let taskAllAmount = 0;
  let taskDoneAmount = 0;

  children.forEach(({ props: { status, mdxType } }) => {
    if (mdxType === 'Task') {
      if (status != 'discarded') {
        taskAllAmount += 1;

        if (status == 'done') {
          taskDoneAmount += 1;
        }
      }
    }
  });

  const progress = ((taskDoneAmount / taskAllAmount) * 100).toFixed(2) + '%';

  return (
    <div className={clsx(styles.taskTable, styles[status])}>
      <div className={clsx(styles.tasksProgress)}>
        <span>{i18n('开发总体进度：')}</span>
        <div className={clsx(styles.progressBar)}>
          <div className={clsx(styles.progress)} style={{ width: progress }} />
          <div className={clsx(styles.label)}>{progress}</div>
        </div>
        <span>
          {taskDoneAmount}/{taskAllAmount}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th>{i18n('状态')}</th>
            <th>{i18n('开始时间')}</th>
            <th>{i18n('结束时间')}</th>
            <th>{i18n('开发内容')}</th>
            <th>{i18n('备注')}</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      <div className={clsx(styles.mask)}>{renderStatus(status)}</div>
    </div>
  );
}

export function Task({ children, status, startDate, endDate }) {
  const comments = [];
  const contents = [];

  children.forEach((child) => {
    if (child.props.mdxType === 'Comment') {
      comments.push(child);
    } else {
      contents.push(child);
    }
  });

  return (
    <tr className={status === 'discarded' ? clsx(styles.taskDiscarded) : ''}>
      <td>
        <span className={clsx(styles.taskStatus, styles[status])}>
          {renderStatus(status)}
        </span>
      </td>
      <td>{startDate}</td>
      <td>{endDate}</td>
      <td className={clsx(styles.taskContent)}>{contents}</td>
      <td>{comments}</td>
    </tr>
  );
}

export function Comment({ children }) {
  return children || '';
}

function renderStatus(status) {
  switch (status) {
    case 'done':
      return i18n('已完成');
    case 'doing':
      return i18n('进行中');
    case 'pending':
      return i18n('未开始');
    case 'hold':
      return i18n('已暂停');
    case 'discarded':
      return i18n('已取消');
  }
  return '';
}
