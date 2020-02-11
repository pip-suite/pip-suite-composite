# <img src="https://github.com/pip-webui/pip-webui/raw/master/doc/Logo.png" alt="Pip.WebUI Logo" style="max-width:30%"> <br/> Composite content controls

![](https://img.shields.io/badge/license-MIT-blue.svg)

Pip.WebUI.Settings module contains a number of controls to visualize and edit complex unstructured and semi-structured content composed of pictures, documents, locations, video or audio, and, of cause, hypertext with formatting and links.

### Composite view

**Composite view** controls shows read-only version of composite content. The content structured as blocks with hypertext, images, documents, locations, checklists. The only allowed action is to check/uncheck item in checklists.

<img src="https://github.com/pip-webui/pip-webui-composite/raw/master/doc/images/img-composite-view.png"/>

### Composite summary

This is a shorter version of **Composite view** control for previews and tiles. It shows only first 3 blocks. Text and lists are truncated to keep it concise. **Composite summary** does not support check/uncheck of checklist items.

<img src="https://github.com/pip-webui/pip-webui-composite/raw/master/doc/images/img-composite-summary.png"/>

### Composite edit

**Composite edit** control allows to construct complex content using blocks with hypertext, images, documents, locations and checklists. Blocks can be added, moved up or down or removed. Hypertext is entered using popular markdown format.

<img src="https://github.com/pip-webui/pip-webui-composite/raw/master/doc/images/img-composite-filled.png"/>

### Checklist view

**Checklist view** control shows read-only version of checklist and only allows to check/uncheck items. This control is integrated inside **Composite view** and **Composite summary**, but it also can be used independently.

<img src="https://github.com/pip-webui/pip-webui-composite/raw/master/doc/images/img-checklist-view.png"/>

### Checklist edit

**Checklist edit** control allows to edit checklist with textual items. It allows to append or insert new items, edit them, change their order or remove them. This control is integrated into **Composite edit**, but it can also be used independently.

<img src="https://github.com/pip-webui/pip-webui-composite/raw/master/doc/images/img-checklist-edit.png"/>

### Content switch

**Content switch** control helps to construct own vesion of a simple composite content. By clicking a button user can add or remove text, images, files or location elements.

<img src="https://github.com/pip-webui/pip-webui-composite/raw/master/doc/images/img-composite-switch.png"/>


## Learn more about the module

- [User's guide](https://github.com/pip-webui/pip-webui-composite/blob/master/doc/UsersGuide.md)
- [Online samples](http://webui.pipdevs.com/pip-webui-composite/index.html)
- [API reference](http://webui-api.pipdevs.com/pip-webui-composite/index.html)
- [Developer's guide](https://github.com/pip-webui/pip-webui-composite/blob/master/doc/DevelopersGuide.md)
- [Changelog](https://github.com/pip-webui/pip-webui-composite/blob/master/CHANGELOG.md)
- [Pip.WebUI project website](http://www.pipwebui.org)
- [Pip.WebUI project wiki](https://github.com/pip-webui/pip-webui/wiki)
- [Pip.WebUI discussion forum](https://groups.google.com/forum/#!forum/pip-webui)
- [Pip.WebUI team blog](https://pip-webui.blogspot.com/)

## <a name="dependencies"></a>Module dependencies

* [pip-webui-lib](https://github.com/pip-webui/pip-webui-lib): angular, angular material and other 3rd party libraries
* [pip-webui-css](https://github.com/pip-webui/pip-webui-css): CSS styles and web components
* [pip-webui-core](https://github.com/pip-webui/pip-webui-core): localization and other core services
* [pip-webui-rest](https://github.com/pip-webui/pip-webui-rest): REST resources for files
* [pip-webui-locations](https://github.com/pip-webui/pip-webui-locations): location view and edit controls
* [pip-webui-pictures](https://github.com/pip-webui/pip-webui-pictures): picture view and edit controls
* [pip-webui-documents](https://github.com/pip-webui/pip-webui-documents): document attachments view and edit controls

## <a name="license"></a>License

This module is released under [MIT license](License) and totally free for commercial and non-commercial use.
