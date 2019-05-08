pimcore.registerNS("pimcore.YouweMultiCloner");

pimcore.YouweMultiCloner = Class.create({
    multiCloneWindowPanel: null,
    multiCloneFormPanel: null,
    record: null,

    getClassName: function () {
        return "pimcore.YouweMultiCloner";
    },

    attach: function(menu, record) {
        this.record = record;
        if (this.record.data.type != "folder" && this.record.data.permissions.create) {
            menu.add("-");
            menu.add(new Ext.menu.Item({
                text: t('Clone Multiple'),
                iconCls: "pimcore_icon_add",
                handler: this.multiCloneForm.bind(this)
            }));
        }
    },

    multiCloneForm: function() {
        this.multiCloneWindowPanel = Ext.create('Ext.window.Window', {
            title: 'Create multiple clones of an object',
            modal:true,
            closeAction:'destroy',
            items: [this.createCloneForm()]
        }).show();
    },

    createCloneForm: function() {
        return this.multiCloneFormPanel = Ext.create('Ext.form.Panel',{
            url: '/admin/youwe_multi_cloner/clone',
            width: 500,
            bodyPadding: 10,
            items: [
                {
                    xtype: 'numberfield',
                    width: 480,
                    labelWidth: 300,
                    fieldLabel: 'Number of clones to create',
                    name: 'cloneCount',
                    allowBlank: false,
                    minValue: 1,
                    maxValue: 1000
                }, {
                    xtype: 'textfield',
                    width: 480,
                    labelWidth: 100,
                    fieldLabel: 'Folder',
                    name: 'parentPath',
                    allowBlank: false,
                    value: this.record.data.basePath,
                    listeners: {
                        'change': function (field) {
                            var moveOriginalField = this.multiCloneFormPanel.getForm().findField('moveOriginal');
                            if(field.isDirty()) {
                                moveOriginalField.setDisabled(false);
                            } else {
                                moveOriginalField.setValue(false);
                                moveOriginalField.setDisabled(true);
                            }
                        }.bind(this)
                    }
                }, {
                    xtype: 'checkbox',
                    width: 480,
                    labelWidth: 300,
                    fieldLabel: 'Move original object to folder as well',
                    name: 'moveOriginal',
                    disabled: true
                }, {
                    xtype: 'checkbox',
                    width: 480,
                    labelWidth: 300,
                    fieldLabel: 'Open folder after cloning',
                    name: 'openFolder'
                }, {
                    xtype: 'numberfield',
                    name: 'objectId',
                    hidden: true,
                    value: this.record.id
                },
            ],
            buttons: [
                {
                    text: t('Create'),
                    iconCls: 'pimcore_icon_apply',
                    handler: function () {
                        var form = this.multiCloneFormPanel;
                        if (form.isValid()) {
                            this.multiCloneWindowPanel.hide();
                            pimcore.helpers.loadingShow();
                            form.submit({
                                success: function (form, action) {
                                    var response = Ext.decode(action.response.responseText);
                                    pimcore.helpers.loadingHide();
                                    pimcore.helpers.showNotification(t("Success"), t("Cloning succesful"), "success");
                                    this.multiCloneWindowPanel.destroy();
                                    pimcore.elementservice.refreshNodeAllTrees("object", this.record.data.parentId);
                                    if(response.openFolder) {
                                        pimcore.helpers.openElement(response.parentFolderId, 'object');
                                    }
                                }.bind(this),
                                failure: function () {
                                    pimcore.helpers.loadingHide();
                                    pimcore.helpers.showNotification(t("Error"), t("Cloning UNsuccesful"), "error");
                                }.bind(this)
                            })
                        }
                    }.bind(this)
                }
            ]
        });
    },

});

var YouweMultiCloner = new pimcore.YouweMultiCloner();

