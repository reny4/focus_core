import type { DriveStep } from 'driver.js'

export const TUTORIAL_STORAGE_KEY = 'focus-core:tutorial-completed'

// Steps are generated at call-time so we can pick the right stats selector
// based on viewport width (desktop vs mobile layout)
export function getTutorialSteps(): DriveStep[] {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const statsElement = isMobile ? '[data-tutorial="stats-tab"]' : '[data-tutorial="stats-panel"]'

  return [
    {
      element: '[data-tutorial="tag-section"]',
      popover: {
        title: 'タグで分類する',
        description:
          'タグは集中する分野のカテゴリです。「勉強」「開発」「読書」など、\n' +
          '自分の活動に合わせて作成できます。',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tutorial="task-list"]',
      popover: {
        title: 'タスクは「集中の対象」',
        description:
          'タスクはToDoではありません。\n' +
          '「DDD設計」「AtCoder」のように、繰り返し集中する対象を登録します。\n' +
          '完了・未完了は関係なく、何度でも使えます。',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tutorial="add-task-button"]',
      popover: {
        title: 'まずタスクを作ってみましょう',
        description:
          'タグを選んでタスク名を入力するだけで作成できます。\n' +
          'タスクを選択するとセッションを開始できるようになります。',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-tutorial="duration-input"]',
      popover: {
        title: '目標時間を設定する',
        description:
          '集中したい時間を選びます。\n' +
          'プリセットから選ぶか、カスタムで入力してください。',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tutorial="start-button"]',
      popover: {
        title: 'Start で集中を開始',
        description:
          'タスクを選択して Start を押すとタイマーが始まります。\n' +
          '目標時間を過ぎても自動で止まりません。\n' +
          'ゾーンに入っているときは集中を続けてください。',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tutorial="session-controls"]',
      popover: {
        title: '集中を終えるとき',
        description:
          '「終了して記録する」で集中を記録として保存します。\n' +
          '「破棄する」は誤って開始したときに使います。記録には残りません。',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: statsElement,
      popover: {
        title: '集中の積み重ねを見る',
        description:
          '「統計」タブで日・週・月・年ごとの集中時間を確認できます。\n' +
          '継続した集中がヒートマップとして可視化されます。',
        side: isMobile ? 'top' : 'left',
        align: 'start',
      },
    },
  ]
}
