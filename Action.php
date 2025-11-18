<?php
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

/**
 * DPlayerMAX Action处理类
 */
class DPlayerMAX_Action extends Typecho_Widget implements Widget_Interface_Do
{
    /**
     * 执行动作
     */
    public function action()
    {
        $this->widget('Widget_User')->pass('administrator');
        $this->on($this->request->is('do=update'))->update();
    }

    /**
     * 处理更新请求
     */
    public function update()
    {
        // 验证用户权限
        $user = $this->widget('Widget_User');
        if (!$user->pass('administrator', true)) {
            $this->response->throwJson([
                'success' => false,
                'message' => '权限不足',
                'error' => '只有管理员可以执行更新操作'
            ]);
        }

        $action = $this->request->get('action', 'check');

        if ($action === 'check') {
            // 检查更新
            $result = DPlayerMAX_Plugin::checkUpdate();
            $this->response->throwJson($result);
        } elseif ($action === 'perform') {
            // 执行更新
            $result = DPlayerMAX_Plugin::performUpdate();
            $this->response->throwJson($result);
        } else {
            $this->response->throwJson([
                'success' => false,
                'message' => '无效的操作',
                'error' => '不支持的action参数'
            ]);
        }
    }
}
