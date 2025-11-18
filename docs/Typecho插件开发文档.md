# 插件基本结构

我们先来了解一下Typecho插件的基本结构吧。

首先就是头部的信息注释部份。 最上面的注释是插件的功能描述，将显示在插件列表中。

> @package 后跟的是插件的名称。如本插件名称为HelloWorld。

> @author 后跟的是插件的作者。如本插件的作者为qining

> @link 后跟的是插件作者的主页。在插件列表中，点击作者名字，将跳转到该页面。

> @dependence 后跟的是插件的版本依赖。要注意的是：这个不是Typecho的发行版本，而是构建版本。如：9.9.2-*则表示插件运行在构建版本为9.9.2以后的版本。Typecho的构建版本号可以在后台的最下方方便地看到。

> @version 插件的版本号。将作为插件的版本号显示在插件列表。

接着往下，开始插件的类的定义。 插件的类名和插件的文件名及存放路径有关。 Typecho的插件一般采用两种方式来存放。

> 简单的单文件插件，可以直接以“插件名.php”的形式存放在plugins目录下。此时，类名直接与文件名同名。

> 当然，对于复杂一点的插件，一般建议第二种方法：以“Plugin.php”的文件名，存放在plugins的“插件名”子目录下，此时，类的名字就必须为“路径名_Plugin”了。

定义后类后，接下来就是插件的函数接口了。Typecho的插件主要有四个函数接口：

`public static function activate()` 这个是插件的激活接口，主要填写一些插件的初始化程序。

`public static function deactivate()` 这个是插件的禁用接口，主要就是插件在禁用时对一些资源的释放。

`public static function config(Typecho_Widget_Helper_Form $form)` 插件的配置面板，用于制作插件的标准配置菜单。

`public static function personalConfig(Typecho_Widget_Helper_Form $form)` 插件的个性化配置面板。用法暂时还不明，有待Hanny进一步研究。

先说这么多吧，下一篇，将以HelloWorld为例子，介绍一下一些基本用法。

# 第一个插件 Hello World

## 一、基本结构

### 1.文件结构
```
HelloWorld  插件文件夹
     |
     |——Plugin.php   插件核心文件
```
插件文件夹命名与插件名、插件类名保持一致，插件主体代码编写在 Plugin.php 中。其中，类名要加上后缀 _Plugin，如下：
```
class HelloWorld_Plugin implements Typecho_Plugin_Interface
{
```
关于命名规范、编码风格等，可以查看http://docs.typecho.org/phpcoding

### 2.注释
```
/**
 * Hello World
 * 
 * @package HelloWorld 
 * @author qining
 * @version 1.0.0
 * @link http://typecho.org
 */
```
 - Hello World: 插件描述
 - @package: 插件名称
 - @author: 插件作者
 - @version: 插件版本
 - @link: 插件作者链接

### 3.插件主体
```php
/* 激活插件方法 */
public static function activate(){}
 
/* 禁用插件方法 */
public static function deactivate(){}
 
/* 插件配置方法 */
public static function config(Typecho_Widget_Helper_Form $form){}
 
/* 个人用户的配置方法 */
public static function personalConfig(Typecho_Widget_Helper_Form $form){}
 
/* 插件实现方法 */
public static function render(){}
```
 - activate: 插件的激活接口，主要填写一些插件的初始化程序。
 - deactivate: 这个是插件的禁用接口，主要就是插件在禁用时对一些资源的释放。
 - config: 插件的配置面板，用于制作插件的标准配置菜单。
 - personalConfig: 个人用户的配置面板，基本用不到。
 - render: 自己定义的方法，用来实现插件要完成的功能。

## 二、实现过程
### 1.插件分析
插件功能，是为了实现用户登录后，在后台菜单导航栏输出欢迎话语，所以我们要做的，就是找找后台菜单文件，是否有提供到此类功能的插件接口。一般来说，用哪个接口来实现功能，是要看我们要写的插件，用到哪一方面的功能，或者实现哪些效果来判断，再到对应的文件去寻找。很幸运，我们在[/admin/menu.php][1] 中找到了以下接口，大概在第7行左右：
```php
<?php Typecho_Plugin::factory('admin/menu.php')->navBar(); ?>
```
这就是我们要在激活插件里要写入的接口代码。插件接口，常以下面的两种方式出现：
```php
Typecho_Plugin::factory()->function();
$this->pluginHandle()->function();
```
我们找好接口代码后，下面便开始编写我们的插件代码。

### 2.编写代码
平常编写代码的顺序，基本按照默认办法出现的顺序来编写。所以，我们先开始写激活接口代码：
```php
public static function activate()
{
    Typecho_Plugin::factory('admin/menu.php')->navBar = array('HelloWorld_Plugin', 'render');
}
```
其中 = 号前面的那段代码，便是我们上面所找到的接口代码，只需要把它复制进来即可，后面是我们插件要实现的方法，这段代码会在接口处运行。
```php
array('HelloWorld_Plugin', 'render');
// 赋值以数组形式出现
// HelloWorld_Plugin 插件的类名，一般是插件名加上“_Plugin”，其中类名还可以用__CLASS__，不过经常是直接把插件类名写上
// render 插件实现的方法名，后面插件实现方法的命名要与此一致
```
该插件注销时没有什么资源需要释放，所以禁用方法就不需要编写了。接下来是编写配置方法。登录后台后，欢迎话语因人而已，所以我们需要给个配置表单给用户，由他们自己定制。因此，我们在配置方法里，可以写上一个配置欢迎话语的表单：
```php
public static function config(Typecho_Widget_Helper_Form $form)
{
    /** 配置欢迎话语 */
    $name = new Typecho_Widget_Helper_Form_Element_Text('word', NULL, 'Hello World', _t('说点什么'));
    $form->addInput($name);
}
```
表单助手类参数说明：

**1,** word：配置项命名
**2,** NULL：选项，因为这是个文本输入框，所以是NULL
**3,** Hello World：默认值
**4,** _t('说点什么')：表单的 label 标题，它后面还有一个参数是描述

要想了解更多使用，可以查阅[/var/Typecho/Widget/Helper/Form/Element.php][2]

```php
$form->addInput($name);
```

这句则是把定义的变量写入到配置项中，以便后面使用。接下来，便是我们插件实现的方法。

因上面激活接口那，我们把插件实现的方法名取为 render，所以我们要在插件里，自定义一个名为 render 的函数：
```php
public static function render()
{
    // 逻辑代码
}
```
接下来，我们要显示已经自定义好的欢迎话语，所以逻辑代码里，我们可以这么写：
```php
echo '<span class="message success">' . Typecho_Widget::widget('Widget_Options')->plugin('HelloWorld')->word . '</span>';
```
其中，下面这句是调用插件配置项的：
```php
Typecho_Widget::widget('Widget_Options')->plugin('HelloWorld')->word
```
方式是：Options + 插件名(不带_Plugin) + 配置项名

当然，你也可以通过 Helper 助手来获取。
```
Helper::options()->plugin('HelloWorld')->word
```
更多 Helper 助手用法，请查阅[/var/Helper.php][3]

至此，我们的 HelloWorld 插件已完成，感谢！欢迎诸君多分享插件！


[1]: https://github.com/typecho/typecho/blob/master/admin/menu.php
[2]: https://github.com/typecho/typecho/blob/master/var/Typecho/Widget/Helper/Form/Element.php
[3]: https://github.com/typecho/typecho/blob/master/var/Helper.php

# 插件接口及功能列表

### 默认接口
在Typecho中只要这个类是继承自`Typecho_Widget`基类，它就默认具备了这个插件接口。接口开发者可以使用这个接口无缝地向当前的Class中注入方法

比如我要给`Widget_Archive`类增加一个方法获取当前文章的字数(charactersNum)，只需要在你的插件`activate`方法中声明
```php
Typecho_Plugin::factory('Widget_Archive')->___charactersNum = array('MyPlugin', 'charactersNum');
```
注意，我们在方法名前面加三个下划线表示这是一个内部方法。而实现这个方法也很简单，因为系统会将当前的对象作为参数传递给你
```php
public static function charactersNum($archive)
{
    return mb_strlen($archive->text, 'UTF-8');
}
```
那么这个方法就已经植入到`Widget_Archive`中去了，你在模版中可以直接调用如下代码输出它
```php
<?php $this->charactersNum(); ?>
```

### Widget接口

|接口|参数|描述|
|:--|:--|:--|
|indexHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问最近文章首页以及分页时被触发|
|error404Handle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问404页面时被触发|
|singleHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问单独页面时被触发(文章，页面，附件)|
|categoryHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问按分类归档页面时被触发|
|tagHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问按标签归档页面时被触发|
|authorHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问按作者归档页面时被触发|
|dateHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问按日期归档页面时被触发|
|search|$keywords 搜索关键词<br>$archive Widget_Archive对象|这是一个独占接口，当访问搜索页面时被触发，当这个接口被实现后，系统自己的搜索动作将不会继续，你需要在这个接口内自己push搜索的数据到Widget_Archive对象，此接口多用于自己实现站内搜索来替换默认的|
|searchHandle|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|当访问搜索页面时被触发|
|query|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|Widget_Archive所有的数据库查询动作最终将由一个query方法来执行，此接口在query方法内，多用于hack某些查询语句|
|select|$archive Widget_Archive对象||
|handleInit|$archive Widget_Archive对象<br>$select Typecho_Db_Query对象|handle初始化|
|handle|type$archive Widget_Archive对象<br>$select Typecho_Db_Query对象||
|pageNav|currentPage<br>$totalpageSize<br>$prev<br>$next<br>$splitPage<br>$splitWord||
|headerOptions|$allows$archive Widget_Archive对象||
|header|$header<br>$archive Widget_Archive对象|主题head部分内容接口，一般用于引入css|
|footer|$archive Widget_Archive对象|主题页脚部分内容接口，一般用于引入JavaScript|
|beforeRender|$archive Widget_Archive对象|在渲染主题前|
|afterRender|$archive Widget_Archive对象|在渲染主题后|
|commentFeedItem|feedType<br>$comments||
|feedItem|feedType<br>$archive Widget_Archive对象||

### Widget_Feedback
|接口|参数|描述|
|:--|:--|:--|
|comment|$comment<br>content||
|finishComment|$feedback Widget_Feedback对象||
|trackback|$trackback<br>content||
|finishTrackback|$feedback Widget_Feedback对象||

### Widget_Login
|接口|参数|描述|
|:--|:--|:--|
|loginFail|user<br>name<br>password<br>remember||
|loginSucceed|<br>user<br>name<br>password<br>remember||

### Widget_Logout
|接口|参数|描述|
|:--|:--|:--|
|logout|无||

### Widget_Register
|接口|参数|描述|
|:--|:--|:--|
|register|$dataStruct||
|finishRegister|$register Widget_Register对象||

### Widget_Upload
|接口|参数|描述|
|:--|:--|:--|
|beforeUpload|$result||
|upload|$upload Widget_Upload对象||
|beforeModify|$result||
|modify|$upload Widget_Upload对象||

### Widget_User
|接口|参数|描述|
|:--|:--|:--|
|login|$name<br>$password<br>$temporarily<br>$expire||
|hashValidate|$password<br>$user['password']||
|loginSucceed|$user Widget_User对象<br>$name<br>$password<br>$temporarily<br>$expire||
|loginFail|$user Widget_User对象<br>$name<br>$password<br>$temporarily<br>$expire||
|logout|无||

### Widget_XmlRpc
|接口|参数|描述|
|:--|:--|:--|
|textFilter|$input['text']<br>$xmlRpc Widget_XmlRpc对象||
|upload|$xmlRpc Widget_XmlRpc对象||
|pingback|$pingback<br>$post||
|finishPingback|$xmlRpc Widget_XmlRpc对象||

### Widget_Abstract_Comments

|接口|参数|描述|
|:--|:--|:--|
|content|$text<br>$comments Widget_Abstract_Comments对象|以下句柄同样具有此接口:<br>Widget_Feedback<br>Widget_Comments_Admin<br>Widget_Comments_Archive<br>Widget_Comments_Edit<br>Widget_Comments_Ping<br>Widget_Comments_Recent||
|contentEx|$text<br>$comments Widget_Abstract_Comments对象|以下句柄同样具有此接口:<br>Widget_Feedback<br>Widget_Comments_Admin<br>Widget_Comments_Archive<br>Widget_Comments_Edit<br>Widget_Comments_Ping<br>Widget_Comments_Recent||
|filter|$value<br>$comments Widget_Abstract_Comments对象|以下句柄同样具有此接口:<br>Widget_Feedback<br>Widget_Comments_Admin<br>Widget_Comments_Archive<br>Widget_Comments_Edit<br>Widget_Comments_Ping<br>Widget_Comments_Recent||
|gravatar|$size<br>$rating<br>$default<br>$comments Widget_Abstract_Comments对象|以下句柄同样具有此接口:<br>Widget_Feedback<br>Widget_Comments_Admin<br>Widget_Comments_Archive<br>Widget_Comments_Edit<br>Widget_Comments_Ping<br>Widget_Comments_Recent||
|autoP|$text|以下句柄同样具有此接口:<br>Widget_Feedback<br>Widget_Comments_Admin<br>Widget_Comments_Archive<br>Widget_Comments_Edit<br>Widget_Comments_Ping<br>Widget_Comments_Recent||
|markdown|$text|以下句柄同样具有此接口:<br>Widget_Feedback<br>Widget_Comments_Admin<br>Widget_Comments_Archive<br>Widget_Comments_Edit<br>Widget_Comments_Ping<br>Widget_Comments_Recent||

### Widget_Abstract_Contents

|接口|参数|描述|
|:--|:--|:--|
|excerpt|text<br>$contents Widget_Abstract_Contents对象|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|excerptEx|$excerpt<br>$contents Widget_Abstract_Contents对象|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|content|text<br>$contents Widget_Abstract_Contents对象|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|contentEx|$content<br>$contents Widget_Abstract_Contents对象|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|isFieldReadOnly|$name|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|filter|$value<br>$contents Widget_Abstract_Contents对象|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|title|title<br>$contents Widget_Abstract_Contents对象|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|autoP|$text|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|
|markdown|$text|以下句柄同样具有此接口:<br>Widget_Archive<br>Widget_Upload<br>Widget_XmlRpc<br>Widget_Contents_Related<br>Widget_Contents_Attachment_Admin<br>Widget_Contents_Attachment_Related<br>Widget_Contents_Attachment_Unattached<br>Widget_Contents_Page_List<br>Widget_Contents_Post_Admin<br>Widget_Contents_Page_Admin<br>Widget_Contents_Post_Edit<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit<br>Widget_Contents_Post_Recent<br>Widget_Contents_Related_Author|

### Widget_Abstract_Metas

|接口|参数|描述|
|:--|:--|:--|
|filter|$value<br>$metas Widget_Abstract_Metas对象|以下句柄同样具有此接口:<br>Widget_Metas_Category_Edit<br>Widget_Metas_Category_List<br>Widget_Metas_Category_Admin<br>Widget_Metas_Tag_Cloud<br>Widget_Metas_Tag_Admin<br>Widget_Metas_Tag_Edit|

### Widget_Abstract_Users

|接口|参数|描述|
|:--|:--|:--|
|filter|$value<br>$users Widget_Abstract_Users对象|以下句柄同样具有此接口:<br>Widget_Login<br>Widget_Logout<br>Widget_Register<br>Widget_Users_Admin<br>Widget_Users_Author<br>Widget_Users_Edit<br>Widget_Users_Profile|

### Widget_Comments_Archive

|接口|参数|描述|
|:--|:--|:--|
|listComments|singleCommentOptions<br>$archive Widget_Comments_Archive对象||
|reply|$word<br>$archive Widget_Comments_Archive对象||
|cancelReply|$word<br>$archive Widget_Comments_Archive对象||

### Widget_Comments_Edit

|接口|参数|描述|
|:--|:--|:--|
|mark|$comment<br>$edit Widget_Comments_Edit对象<br>$status||
|delete|$comment<br>$edit Widget_Comments_Edit对象||
|finishDelete|$comment<br>$edit Widget_Comments_Edit对象||
|edit|$comment<br>$edit Widget_Comments_Edit对象||
|finishEdit|$edit Widget_Comments_Edit对象||
|comment|$comment<br>$edit Widget_Comments_Edit对象||
|finishComment|$edit Widget_Comments_Edit对象||

### Widget_Contents_Attachment_Edit

|接口|参数|描述|
|:--|:--|:--|
|delete|$post<br>$edit Widget_Contents_Attachment_Edit对象||
|finishDelete|$post<br>$edit Widget_Contents_Attachment_Edit对象||
|delete|$post<br>$edit Widget_Contents_Attachment_Edit对象||
|finishDelete|$post<br>$edit Widget_Contents_Attachment_Edit对象||

### Widget_Contents_Page_Edit

|接口|参数|描述|
|:--|:--|:--|
|write|$contents<br>$edit Widget_Contents_Page_Edit对象||
|finishPublish|$contents<br>$edit Widget_Contents_Page_Edit对象||
|finishSave|$contents<br>$edit Widget_Contents_Page_Edit对象||
|delete|$page<br>$edit Widget_Contents_Page_Edit对象||
|finishDelete|$page<br>$edit Widget_Contents_Page_Edit对象||

### Widget_Contents_Post_Edit

|接口|参数|描述|
|:--|:--|:--|
|getDefaultFieldItems|$layout|以下句柄同样具有此接口:<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit|
|write|$contents<br>$edit Widget_Contents_Post_Edit对象|以下句柄同样具有此接口:<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit|
|finishPublish|$contents<br>$edit Widget_Contents_Post_Edit对象|以下句柄同样具有此接口:<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit|
|finishSave|$contents<br>$edit Widget_Contents_Post_Edit对象|以下句柄同样具有此接口:<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit|
|delete|$post<br>$edit Widget_Contents_Post_Edit对象|以下句柄同样具有此接口:<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit|
|finishDelete|$post<br>$edit Widget_Contents_Post_Edit对象|以下句柄同样具有此接口:<br>Widget_Contents_Attachment_Edit<br>Widget_Contents_Page_Edit|

### Widget_Metas_Category_List

|接口|参数|描述|
|:--|:--|:--|
|listCategories|categoryOptions<br>$list Widget_Metas_Category_List对象|以下句柄同样具有此接口:<br>Widget_Metas_Category_Admin|
