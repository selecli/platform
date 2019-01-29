<template>
  <div class="list">
    <div class="list-devider"></div>
    <Table border
           stripe
           class="list-table"
           ref="selection"
           :columns="title"
           :data="allList"
           @on-selection-change="checkList"
           @on-sort-change="sortList"
    ></Table>
    <Page
      :total="listTotal"
      show-total
      show-elevator
      show-sizer
      :current="currentPage"
      :page-size="pageSize"
      placement="top"
      :page-size-opts="pageSizeArr"
      @on-change="changePage"
      @on-page-size-change="changePageSize"
      class="list-page"
    ></Page>
    <Modal
      v-model="showEditTag"
      :title="editAppInfo.name"
      width="70"
      @on-ok="editOk"
      @on-cancel="editCancel"
      v-if="this.$router.currentRoute.name === 'sorts'"
      ref="modal">
      <edit></edit>
    </Modal>
    <Modal
      v-model="jwoodModal"
      :title="editJwoodInfo.appName"
      @on-ok="ok"
      @on-cancel="cancel"
      ref="modal">
      <editJwood></editJwood>
    </Modal>
    <Modal v-model="modal2" width="360">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="information-circled"></Icon>
            <span>删除确认</span>
        </p>
        <div style="text-align:center">
            <p>你确定要删除本条规则吗？</p>
        </div>
        <div slot="footer">
            <Button type="error" size="large" long  @click="del">删除</Button>
        </div>
    </Modal>

    
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import edit from '../../components/workflow/edit';
import editJwood from '../../components/building/edit';

export default {
  name: 'workflowList',
  data() {
    return {
      modal2: false,
      title: [],
      title2: [],
      title3: [],
      selectVal: '',
      year: '',
      month: '',
      day: '',
      delId: -1,
      tagsResult: 0,
      jwoodModal: false,
      editKey: '',  // 显示修改框的值
      allList: [],  // 展示的所有列表数据
      pageSizeArr: [20, 50, 100],  // 每页展示的条数
      tagObj: {
        key: 'appTagId',
        render: (h, params) => {
          const tmp = [];
          const tmp2 = [];
          const tmp3 = [];
          if (params.row.pkgDetails) {
            params.row.pkgDetails.forEach((todo) => {
              if (todo.sourceName === 'BaseType') {
                tmp.push(todo.pkgName);
              } else if (todo.sourceName === 'TD分类') {
                tmp2.push(todo.pkgName);
              } else {
                tmp3.push(todo.pkgName);
              }
            });
          }
          return h('Tooltip', [
            h('p', tmp.join(',')),
            h('div', {
              slot: 'content',
            },
              tmp.map(pkg => h('p', pkg)),
            ),
          ]);
        },
        renderHeader: (h, params) => h('Tooltip', {
          attrs: {
            content: '分类',
            aaa: params,
          },
          class: 'create-pop',
        }, [
          '分类',
        ]),
        ellipsis: true,
        filters: [
          { label: 'BaseType', value: 1 },
          { label: 'TD分类', value: 2 },
          { label: 'TD标签', value: 3 },
        ],
        filterMultiple: false,
        filterMethod: () => {
        },
      },
    };
  },
  computed: mapState([
    'spinShow',
    'listContent',
    'listArr',
    'listTotal',
    'currentPage',
    'stepVal',
    'tags',
    'showDetails',
    'dataDetails',
    'showEditTag',
    'editAppInfo',
    'resultShowTitles',
    'sortObj',
    'resultParams',
    'pageSize',
    'isGet',
    'manageUserInfo',
    'showAdd',
    'manageType',
    'showJurisdiction',
    'RoleInfo',
    'viewPower',
    'metaDetails',
    'showEditDetailsInfo',
    'editData',
    'isTitle',
    'dataDetail',
    'metaDetail',
    'subStatus',
    'configName',
    'jwoodTags',
    'jwoodTagInfo',
    'parentcode',
    'tdtypeData',
    'watchName',
    'userInfo',
    'editJwoodInfo',
    'systemId',
    'isShow',
    'condition',
    'ruleInfo',
    'systemData',
    'historyType',
    'filterParams',
    'resultTitles',
    'modify',
  ]),
  mounted() {
//  字典维护页面的判断
    if (this.$router.currentRoute.name === 'sorts') {
      this.title = [
        {
          type: 'selection',
          width: 34,
          align: 'center',
        },
        {
          title: '标签ID',
          key: 'id',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.id,
            },
          }, [
            params.row.id,
          ]),
          ellipsis: true,
        },
        {
          title: '体系名称',
          key: 'name',
          render: (h, params) => {
            const p = params;
            if (params.row.id === this.editKey) {
              return h('Input', {
                props: {
                  value: params.row.name,
                  autofocus: true,
                },
                on: {
                  input: (val) => {
                    p.row.name = val;
                  },
                },
              });
            }
            return h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                  //  this.$store.state.spinShow = true;
                    if (this.tags.indexOf(params.row.name) === -1) {
                      this.$store.state.tags.pop();
                      this.$store.state.tags.push(params.row);
                      this.$store.state.tags.push('');
                    }
                  },
                },
              }, [
                h('Tooltip', {
                  attrs: {
                    content: params.row.name,
                    class: 'ivu-table-cell-ellipsis',
                  },
                }, [
                  params.row.name,
                ]),
              ]),
            ]);
          },
          ellipsis: true,
        },
        {
          title: '标签体系描述',
          key: 'description',
          render: (h, params) => {
            const p = params;
            if (params.row.id === this.editKey) {
              return h('Input', {
                props: {
                  value: params.row.description,
                  autofocus: true,
                },
                on: {
                  input: (val) => {
                    p.row.description = val;
                  },
                },
              });
            }
            return h('div', [
              h('Tooltip', {
                attrs: {
                  content: params.row.description,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.description,
              ]),
            ]);
          },
          ellipsis: true,
        },
        {
          title: '状态',
          key: 'status',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.tagSystemFormatState(params.row.status),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.tagSystemFormatState(params.row.status),
          ]),
          ellipsis: true,
        },
        {
          title: '添加日期',
          key: 'createTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.createTime),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row.createTime),
          ]),
          ellipsis: true,
          width: 160,
        },
        {
          title: '最后更新日期',
          key: 'updateTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.updateTime),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row.updateTime),
          ]),
          ellipsis: true,
          width: 160,
        },
        {
          title: '操作',
          key: '',
          width: 150,
          render: (h, params) => {
            const p = params;
            if (params.row.id === this.editKey) {
              return h('div', [
                h('div', [
                  h('i-switch', {
                    attrs: {
                      value: Boolean(params.row.status),
                    },
                    style: {
                      float: 'left',
                      marginRight: '5px',
                    },
                    nativeOn: {
                      click: () => {
                        p.row.status = p.row.status === 0 ? 1 : 0;
                        this.changeTagstate(p.row);
                      },
                    },
                  }),
                  h('span', {
                    attrs: {
                      class: 'edit-btn',
                    },
                    on: {
                      click: () => {
                        this.changeTagInfo(params.row);
                        this.editKey = '';
                      },
                    },
                  }, '确定'),
                  h('span', {
                    attrs: {
                      class: 'edit-btn',
                    },
                    on: {
                      click: () => {
                        this.getTagSystems();
                        this.editKey = '';
                      },
                    },
                  }, '取消'),
                ]),
              ]);
            }
            return h('div', [
              h('div', [
                h('i-switch', {
                  attrs: {
                    value: Boolean(params.row.status),
                  },
                  nativeOn: {
                    click: () => {
                      p.row.status = p.row.status === 0 ? 1 : 0;
                      this.changeTagstate(p.row);
                    },
                  },
                }),
                h('Button', {
                  props: {
                    type: 'text',
                    icon: 'compose',
                  },
                  style: {
                    marginLeft: '25px',
                    fontSize: '20px',
                  },
                  on: {
                    click: () => {
                      this.editKey = params.row.id;
                    },
                  },
                }),
              ]),
            ]);
          },
        },
        {
          title: '设备标签',
          key: '',
          width: 80,
          render: (h, params) => {
            const p = params;
            return h('div', [
              h('div', [
                h('i-switch', {
                  attrs: {
                    value: Boolean(params.row.modelStatus),
                  },
                  nativeOn: {
                    click: () => {
                      p.row.modelStatus = p.row.modelStatus === 0 ? 1 : 0;
                      this.changeModelstate(p.row);
                    },
                  },
                }),
              ]),
            ]);
          },
        },
      ];
    } else if (this.$router.currentRoute.name === 'workflow') {
      if (this.stepVal === 0) {
        this.title = [
          {
            type: 'selection',
            width: 34,
            align: 'center',
          },
          {
            key: 'appOriginalName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appOriginalName,
              },
            }, [
              params.row.appOriginalName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '原始名称',
                aaa: params,
              },
            }, [
              '原始名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'appPackageName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appPackageName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appPackageName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名',
                aaa: params,
              },
            }, [
              '包名',
            ]),
            ellipsis: true,
          },
          {
            key: 'packageHash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.packageHash,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.packageHash,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'Hash',
                aaa: params,
              },
            }, [
              'Hash',
            ]),
            ellipsis: true,
          },
          {
            key: 'platform',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatPlatorm(params.row.platform),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatPlatorm(params.row.platform),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '平台',
                aaa: params,
              },
            }, [
              '平台',
            ]),
            ellipsis: true,
            width: 70,
          },
          {
            key: 'preAppName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.preAppName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.preAppName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名称',
                aaa: params,
              },
            }, [
              '包名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'packageStatus',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.handleState(params.row.packageStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.handleState(params.row.packageStatus),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '状态',
                aaa: params,
              },
            }, [
              '状态',
            ]),
            ellipsis: true,
            width: 100,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包获取日期',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '包获取日期',
            ]),
            ellipsis: true,
            sortable: 'custom',
            width: 160,
          },
          // {
          //   key: 'updateTime',
          //   render: (h, params) => h('Tooltip', {
          //     attrs: {
          //       content: this.formatDate(params.row.updateTime),
          //       class: 'ivu-table-cell-ellipsis',
          //     },
          //   }, [
          //     this.formatDate(params.row.updateTime),
          //   ]),
          //   renderHeader: (h, params) => h('Tooltip', {
          //     attrs: {
          //       content: '包最近更新时间',
          //       aaa: params,
          //     },
          //     class: 'creat-time',
          //   }, [
          //     '包最近更新时间',
          //   ]),
          //   ellipsis: true,
          //   sortable: 'custom',
          //   width: 160,
          // },
        ];
      } else if (this.stepVal === 1) {
//          this.title = [];
      } else if (this.stepVal === 2) {
//          this.title = [];
      } else if (this.stepVal === 3) {
//          this.title = [];
      } else if (this.stepVal === 4) {
        this.title = [
          {
            type: 'selection',
            width: 34,
            align: 'center',
          },
          {
            key: 'metaId',
            render: (h, params) => h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                },
                on: {
                  click: () => {
                    const data = {
                      data: params.row,
                    };
                    //  this.$store.state.dataDetails = [];
                    this.$store.state.dataDetails = [];
                    this.$store.state.showDetails = true;
                    this.editData = { ...this.editData, data: params.row };
                    this.getMetaIdDetails(data);
                  //  this.$store.state.dataDetails.push(params.row);
                  },
                },
              }, [params.row.metaId === 0 ? '' : params.row.metaId]),

            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'MetaID',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              'MetaID',
            ]),
            ellipsis: true,
            sortable: 'custom',
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
              },
            }, [
              params.row.appName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名称',
                aaa: params,
              },
            }, [
              '包名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'appPackageName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appPackageName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appPackageName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名',
                aaa: params,
              },
            }, [
              '包名',
            ]),
            ellipsis: true,
          },
          {
            key: 'packageHash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.packageHash,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.packageHash,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'Hash',
                aaa: params,
              },
            }, [
              'Hash',
            ]),
            ellipsis: true,
          },
          {
            key: 'pkgTagName',
            render: (h, params) => h('Tooltip', [
              h('p', params.row.pkgTagName),
              h('div', {
                slot: 'content',
              },
                String(params.row.pkgTagName).split(',').map(pkg => h('p', pkg)),
              ),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '分类',
                aaa: params,
              },
            }, [
              '分类',
            ]),
            ellipsis: true,
          },
          {
            key: 'iconUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.iconUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.iconUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '图标地址',
                aaa: params,
              },
            }, [
              '图标地址',
            ]),
            ellipsis: true,
          },
          {
            key: 'developer',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.developer,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.developer,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            ellipsis: true,
          },
          {
            key: 'referenceUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.referenceUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.referenceUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '参考网址',
                aaa: params,
              },
            }, [
              '参考网址',
            ]),
            ellipsis: true,
          },
          {
            key: 'sourceId',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatSource(params.row.sourceId),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatSource(params.row.sourceId),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '来源商店',
                aaa: params,
              },
            }, [
              '来源商店',
            ]),
            ellipsis: true,
          },
          {
            key: 'packageStatus',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.handleState(params.row.packageStatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.handleState(params.row.packageStatus),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包状态',
                aaa: params,
              },
            }, [
              '包状态',
            ]),
            ellipsis: true,
            width: 100,
          },
          {
            key: 'substatus',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.handleStatus(params.row.substatus),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.handleStatus(params.row.substatus),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '提交状态',
                aaa: params,
              },
            }, [
              '提交状态',
            ]),
            ellipsis: true,
            width: 100,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包获取日期',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '包获取日期',
            ]),
            ellipsis: true,
            sortable: 'custom',
            width: 160,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包最近更新时间',
                aaa: params,
              },
              class: 'creat-time',
            }, [
              '包最近更新时间',
            ]),
            ellipsis: true,
            sortable: 'custom',
            width: 160,
          },
        ];
      //  this.title = this.listTitle;
      } else if (this.stepVal === 5) {
        //  this.title =  [];
      }
    } else if (this.$router.currentRoute.name === 'tags') {
//      this.title = []
    } else if (this.$router.currentRoute.name === 'building') {
      this.title = [
        {
          key: 'metaid',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.metaid,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.metaid,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'metaId',
              aaa: params,
            },
          }, [
            'metaId',
          ]),
          ellipsis: true,
          width: 100,
        },
        {
          key: 'appName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appName,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.appName,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '名称',
              aaa: params,
            },
          }, [
            '名称',
          ]),
          ellipsis: true,
        },
        {
          key: 'appCategory',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appCategory,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.appCategory,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TDtype',
              aaa: params,
            },
          }, [
            'TDtype',
          ]),
          ellipsis: true,
        },
        {
          key: 'appDeveloper',
          render: (h, params) => h('div', {
            style: {
            },
          }, [
            h('Tooltip', {
              attrs: {
                content: params.row.appDeveloper,
                class: 'ivu-table-cell-ellipsis',
              },
              style: {
                float: 'left',
              },
            }, [
              params.row.appDeveloper,
            ]),
            h('Button', {
              props: {
                type: 'text',
                icon: 'clipboard',
              },
              style: {
                // position: 'absolute',
                // top: 0,
                // right: 0,
                float: 'right',
              },
              on: {
                click: () => {
                  this.clip(params.row.appDeveloper);
                },
              },
            }),
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '开发者',
              aaa: params,
            },
          }, [
            '开发者',
          ]),
          ellipsis: true,
        },
        {
          key: 'referenceUrl',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.referenceUrl,
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row.referenceUrl,
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '参考网址',
              aaa: params,
            },
          }, [
            '参考网址',
          ]),
          ellipsis: true,
        },
        {
          key: 'updateTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.updateTime),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row.updateTime),
          ]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '更新日期',
              aaa: params,
            },
          }, [
            '更新日期',
          ]),
          ellipsis: true,
        },
      ];
    } else if (this.$router.currentRoute.name === 'manage') {
      this.title = [
        {
          type: 'selection',
          width: 34,
          align: 'center',
        },
        {
          title: '用户名',
          key: 'displayName',
          width: 120,
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.displayName,
            },
          }, [
            params.row.displayName,
          ]),
          ellipsis: true,
        },
        {
          title: '邮箱',
          key: 'email',
          width: 200,
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.email,
            },
          }, [
            params.row.email,
          ]),
          ellipsis: true,
        },
        {
          title: '用户角色',
          key: 'roleInfo',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.roleInfo,
            },
          }, [
            params.row.roleInfo,
          ]),
          ellipsis: true,
        },
        {
          title: '添加日期',
          key: 'createTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.createTime),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row.createTime),
          ]),
          ellipsis: true,
          width: 160,
        },
        {
          title: '操作',
          key: '',
          width: 120,
          render: (h, params) => {
            const p = params;
            return h('div', [
              h('div', [
                h('i-switch', {
                  attrs: {
                    value: Boolean(params.row.status),
                  },
                  nativeOn: {
                    click: () => {
                      p.row.status = p.row.status === 0 ? 1 : 0;
                      this.$Message.loading({
                        duration: 0,
                        content: '上传中',
                      });
                      const self = this;
                      const temp = {
                        data: p.row,
                        callback() {
                          self.$Message.destroy();
                          self.$Notice.success({
                            title: '提示',
                            desc: '修改成功',
                          });
                        },
                      };
                      this.changeUser(temp);
                    },
                  },
                }),
                h('Button', {
                  props: {
                    type: 'text',
                    icon: 'compose',
                  },
                  style: {
                    marginLeft: '25px',
                    fontSize: '20px',
                  },
                  on: {
                    click: () => {
                      this.$store.state.showAdd = !this.showAdd;
                      this.$store.state.manageUserInfo = params.row;
                    },
                  },
                }),
              ]),
            ]);
          },
        },
      ];
    } else if (this.$router.currentRoute.name === 'config') {
      if (this.configName === '1') {
        this.title = [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            key: 'id',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.id,
              },
            }, [params.row.id]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: '体系id',
              },
            }, '体系id'),
            ellipsis: true,
          },
          {
            key: 'name',
            render: (h, params) => {
              const p = params;
              if (params.row.id === this.editKey) {
                return h('Input', {
                  props: {
                    value: params.row.name,
                    autofocus: true,
                  },
                  on: {
                    input: (val) => {
                      p.row.name = val;
                    },
                  },
                });
              }
              return h('div', [
                h('span', {
                  style: {
                    cursor: 'pointer',
                  },
                  on: {
                    click: () => {
                      this.jwoodTags.pop();
                      this.jwoodTags.push(params.row);
                      this.jwoodTags.push('');
                      this.$store.state.modify = true;
                    },
                  },
                }, [h('Tooltip', {
                  attrs: {
                    content: params.row.name,
                  },
                }, [params.row.name])]),
              ]);
            },
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '体系名称',
                aaa: params,
              },
            }, [
              '体系名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'description',
            render: (h, params) => {
              const p = params;
              if (params.row.id === this.editKey) {
                return h('Input', {
                  props: {
                    value: params.row.description,
                    autofocus: true,
                  },
                  on: {
                    input: (val) => {
                      p.row.description = val;
                    },
                  },
                });
              }
              return h('Tooltip', {
                attrs: {
                  content: params.row.description,
                },
              }, params.row.description);
            },
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '描述',
                aaa: params,
              },
            }, [
              '描述',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
              },
            }, this.formatDate(params.row.createTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '创建日期',
                aaa: params,
              },
            }, [
              '创建日期',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
              },
            }, this.formatDate(params.row.updateTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新日期',
                aaa: params,
              },
            }, [
              '更新日期',
            ]),
            ellipsis: true,
          },
          {
            key: 'userName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.userName,
              },
            }, params.row.userName),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '操作人',
                aaa: params,
              },
            }, [
              '操作人',
            ]),
            ellipsis: true,
          },
          {
            title: '操作',
            key: '',
            render: (h, params) => {
              if (params.row.id === this.editKey) {
                return h('div', {
                  style: {
                    fontSize: '12px',
                  },
                }, [
                  h('span', {
                    style: {
                      marginLeft: '5px',
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                        console.log(params.row);
                        this.jwoodUpdate(params.row);
                        this.editKey = '';
                      },
                    },
                  }, '确定'),
                  h('span', {
                    style: {
                      marginLeft: '5px',
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                        this.editKey = '';
                      },
                    },
                  }, '取消'),
                ]);
              }
              return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    icon: 'compose',
                  },
                  style: {
                    fontSize: '20px',
                  },
                  on: {
                    click: () => {
                      this.editKey = params.row.id;
                    },
                  },
                }),
              ]);
            },
            ellipsis: true,
          },
        ];
      }
    } else if (this.$router.currentRoute.name === 'outcome') {
      this.title = [
        {
          key: 'metaid',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.metaid,
            },
          }, [params.row.metaid]),
          renderHeader: h => h('Tooltip', {
            attrs: {
              content: 'metaid',
            },
          }, 'metaid'),
          ellipsis: true,
        },
        {
          key: 'appName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appName,
            },
          }, [params.row.appName]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '名称',
              aaa: params,
            },
          }, [
            '名称',
          ]),
          ellipsis: true,
        },
        {
          key: 'mapperTagName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.mapperTagName,
            },
          }, [params.row.mapperTagName]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '定制分类',
              aaa: params,
            },
          }, [
            '定制分类',
          ]),
          ellipsis: true,
        },
        {
          key: 'appCategory',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appCategory,
            },
          }, params.row.appCategory),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TDtype',
              aaa: params,
            },
          }, [
            'TDtype',
          ]),
          ellipsis: true,
        },
        {
          key: 'pkgName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.pkgName,
            },
          }, params.row.pkgName),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '包名',
              aaa: params,
            },
          }, [
            '包名',
          ]),
          ellipsis: true,
        },
        {
          key: 'pkgHash',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.pkgHash,
            },
          }, params.row.pkgHash),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'hash',
              aaa: params,
            },
          }, [
            'hash',
          ]),
          ellipsis: true,
        },
        {
          key: 'createTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.createTime),
            },
          }, this.formatDate(params.row.createTime)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '创建时间',
              aaa: params,
            },
          }, [
            '创建日期',
          ]),
          ellipsis: true,
        },
        {
          key: 'updateTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.updateTime),
            },
          }, this.formatDate(params.row.updateTime)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '更新时间',
              aaa: params,
            },
          }, [
            '更新时间',
          ]),
          ellipsis: true,
        },
        {
          key: 'customType',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.customType,
            },
          }, params.row.customType),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '定制类型',
              aaa: params,
            },
          }, [
            '定制类型',
          ]),
          ellipsis: true,
        },
        {
          key: 'userName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.userName,
            },
          }, params.row.userName),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '操作人',
              aaa: params,
            },
          }, [
            '操作人',
          ]),
          ellipsis: true,
        },
        // {
        //   key: 'userName',
        //   render: (h, params) => h('Tooltip', {
        //     attrs: {
        //       content: params.row.userName,
        //     },
        //   }, params.row.userName),
        //   renderHeader: (h, params) => h('Tooltip', {
        //     attrs: {
        //       content: '数据类型',
        //       aaa: params,
        //     },
        //   }, [
        //     '数据类型',
        //   ]),
        //   ellipsis: true,
        // },
      ];
    } else if (this.$router.currentRoute.name === 'independent') {
      this.title = [
        // {
        //   key: 'metaid',
        //   render: (h, params) => h('Tooltip', {
        //     attrs: {
        //       content: params.row.metaid,
        //     },
        //   }, [params.row.metaid]),
        //   renderHeader: h => h('Tooltip', {
        //     attrs: {
        //       content: '序号',
        //     },
        //   }, '序号'),
        //   ellipsis: true,
        // },
        {
          type: 'selection',
          width: 60,
          align: 'center',
        },
        {
          key: 'pkgName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.pkgName,
            },
          }, [params.row.pkgName]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '包名',
              aaa: params,
            },
          }, [
            '包名',
          ]),
          ellipsis: true,
        },
        {
          key: 'pkgHash',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.pkgHash,
            },
          }, [params.row.pkgHash]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'hash',
              aaa: params,
            },
          }, [
            'hash',
          ]),
          ellipsis: true,
        },
        {
          key: 'metaid',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appcatagory,
            },
          }, params.row.appcatagory),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'metaid',
              aaa: params,
            },
          }, [
            'metaid',
          ]),
          ellipsis: true,
        },
        {
          key: 'appName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appName,
            },
          }, params.row.appName),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '名称',
              aaa: params,
            },
          }, [
            '名称',
          ]),
          ellipsis: true,
        },
        {
          key: 'appCategory',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appCategory,
            },
          }, params.row.appCategory),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TDtype',
              aaa: params,
            },
          }, [
            'TDtype',
          ]),
          ellipsis: true,
        },
        {
          key: 'referenceUrl',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.referenceUrl,
            },
          }, params.row.referenceUrl),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '参考网址',
              aaa: params,
            },
          }, [
            '参考网址',
          ]),
          ellipsis: true,
        },
        {
          key: 'mapperTagName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.mapperTagName,
            },
          }, params.row.mapperTagName),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TDtag',
              aaa: params,
            },
          }, [
            'TDtag',
          ]),
          ellipsis: true,
        },
        {
          key: 'createTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.createTime),
            },
          }, this.formatDate(params.row.createTime)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TDtag创建日期',
              aaa: params,
            },
          }, [
            'TDtag创建日期',
          ]),
          ellipsis: true,
        },
        {
          key: 'updateTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.updateTime),
            },
          }, this.formatDate(params.row.updateTime)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TDtag新时间',
              aaa: params,
            },
          }, [
            'TDtag新时间',
          ]),
          ellipsis: true,
        },
        {
          key: 'userName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.userName,
            },
          }, params.row.userName),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '操作人',
              aaa: params,
            },
          }, [
            '操作人',
          ]),
          ellipsis: true,
        },
        {
          title: '操作',
          key: '',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  icon: 'compose',
                },
                style: {
                  fontSize: '20px',
                },
                on: {
                  click: () => {
                    console.log(params.row);
                    this.jwoodModal = true;
                    this.$store.state.editJwoodInfo = params.row;
                    this.mapperImplTree({ systemId: params.row.systemId });
                  },
                },
              }),
            ]);
          },
          ellipsis: true,
        },
      ];
    } else if (this.$router.currentRoute.name === 'history') {
      this.title = [
        {
          key: 'Metaid',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.metaid,
            },
          }, [params.row.metaid]),
          renderHeader: h => h('Tooltip', {
            attrs: {
              content: 'metaid',
            },
          }, 'metaid'),
          ellipsis: true,
        },
        {
          key: 'appName',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appName,
            },
          }, [params.row.appName]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'APP名称',
              aaa: params,
            },
          }, [
            'APP名称',
          ]),
          ellipsis: true,
        },
        {
          key: 'appCategory',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appCategory,
            },
          }, [params.row.appCategory]),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'TD分类',
              aaa: params,
            },
          }, [
            'TD分类',
          ]),
          ellipsis: true,
        },
        {
          key: 'appIconurl',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appIconurl,
            },
          }, params.row.appIconurl),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '图标地址',
              aaa: params,
            },
          }, [
            '图标地址',
          ]),
          ellipsis: true,
        },
        {
          key: 'appDeveloper',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appDeveloper,
            },
          }, params.row.appDeveloper),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '开发者',
              aaa: params,
            },
          }, [
            '开发者',
          ]),
          ellipsis: true,
        },
        {
          key: 'referenceUrl',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.referenceUrl,
            },
          }, params.row.referenceUrl),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '参考网址',
              aaa: params,
            },
          }, [
            '参考网址',
          ]),
          ellipsis: true,
        },
        {
          key: 'appNameSpell',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appNameSpell,
            },
          }, params.row.appNameSpell),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '名称PY',
              aaa: params,
            },
          }, [
            '名称PY',
          ]),
          ellipsis: true,
        },
        {
          key: 'appNameEn',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appNameEn,
            },
          }, params.row.appNameEn),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '名称EN',
              aaa: params,
            },
          }, [
            '名称EN',
          ]),
          ellipsis: true,
        },
        {
          key: 'appDeveloperEn',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appDeveloperEn,
            },
          }, params.row.appDeveloperEn),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '开发者EN',
              aaa: params,
            },
          }, [
            '开发者EN',
          ]),
          ellipsis: true,
        },
        {
          key: 'appIpgp',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appIpgp,
            },
          }, params.row.appIpgp),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '公司名称',
              aaa: params,
            },
          }, [
            '公司名称',
          ]),
          ellipsis: true,
        },
        {
          key: 'appIpgpEn',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appIpgpEn,
            },
          }, params.row.appIpgpEn),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '公司名称EN',
              aaa: params,
            },
          }, [
            '公司名称EN',
          ]),
          ellipsis: true,
        },
        {
          key: 'platform',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatPlatorm(params.row.platform),
            },
          }, this.formatPlatorm(params.row.platform)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '平台',
              aaa: params,
            },
          }, [
            '平台',
          ]),
          ellipsis: true,
        },
        {
          key: 'appVersion',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.appVersion,
            },
          }, params.row.appVersion),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '应用版本',
              aaa: params,
            },
          }, [
            '应用版本',
          ]),
          ellipsis: true,
        },
        {
          key: 'appOnlineTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.appOnlineTime),
            },
          }, this.formatDate(params.row.appOnlineTime)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '版本时间',
              aaa: params,
            },
          }, [
            '版本时间',
          ]),
          ellipsis: true,
        },
        {
          key: 'metaidCreateTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row.metaidCreateTime),
            },
          }, this.formatDate(params.row.metaidCreateTime)),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: 'metaid创建时间',
              aaa: params,
            },
          }, [
            'metaid创建时间',
          ]),
          ellipsis: true,
        },
        {
          key: 'updateTime',
          render: (h, params) => h('Tooltip', {
            attrs: {
              content: params.row.updateTime,
            },
          }, params.row.updateTime),
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: '更新时间',
              aaa: params,
            },
          }, [
            '更新时间',
          ]),
          ellipsis: true,
        },
      ];
    }
  },
  methods: {
    ...mapActions([
      'getAPPs',
      'getTagSystems',
      'selectTags',
      'changeSystemState',
      'changeTagState',
      'changeSystemInfo',
      'changeTagInfoAction',
      'getResultData',
      'getRelationTags',
      'changeTagRelationPut',
      'getUsers',
      'changeUser',
      'changeSystemModelStatus',
      'changeTagModelStatus',
      'delRole',
      'getMetaIdDetails',
      'getEditTagsFirst',
      'forecastDetails',
      'jwoodUpdate',
      'jwoodMapperUpdate',
      'jmTags',
      'jwoodjmTagsUpdate',
      'mapperImplTree',
      'tdTagResult',
      'jmMiddleDatasRuleed',
      'jmMiddleUpdate',
      'blackListStatus',
      'resultListUpdate',
      'jmAutoMakesUpdate',
      'resultList',
      'jmRulesList',
      'jmRulesRemove',
      'jmRulesUpdate',
      'jmTdTypeData',
      'groupByMetaid',
      'allResultList',
      'jmHighChooseAndSave',
      'jwResultData',
      'mapperImpl',
    ]),
    ...mapMutations([
      'editDataMethods',
      'changeShowConfig',
    ]),
    del() {
      this.jmRulesRemove(this.delId);
      this.modal2 = false;
    },
    perform() {
      this.$refs.selection.selectAll(false);
    },
    clip(val) {
      this.$copyText(val).then(() => {
        this.$Message.success('复制成功');
      }, (e) => {
        console.log(e);
      });
    },
    // 历史数据合包方式
    formatType(val) {
      const states = ['规则合包', '智能合包', '人工合包'];
      return states[val - 1] === '' ? '未知' : states[val - 1];
    },
//  包状态值转换
    handleState(state) {
      const states = ['新入库', 'hash错误', '名称未更改', '名称已更改', '未补全', '已补全', '人工补全', '自动合包成功', '合包失败', '人工修改', '人工合包成功', '重复数据', '搜索无果', '包审核成功', '包审核失败', '质检修改'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
    mappingStatus(state) {
      const states = ['启用', '停用'];
      return states[state] === '' ? '未知' : states[state];
    },
    recycStatus(state) {
      const states = ['无', '日更新', '周更新', '月更新'];
      return states[state] === '' ? '未知' : states[state];
    },
    changeTags(val) {
      this.tagsResult = val;
    },
    ruleStatus(state) {
      const states = ['未执行', '执行中', '执行完成', '未发布', '发布中', '发布完成'];
      return states[state + 1] === '' ? '未知' : states[state + 1];
    },
    ok() {
      const params = {};
      params.id = this.editJwoodInfo.id;
      params.mapperTagId = this.editJwoodInfo.mapperTagId;
      params.systemId = this.editJwoodInfo.systemId;
      params.metaid = this.editJwoodInfo.metaid;
      params.userId = JSON.parse(this.userInfo).userId;
      if (this.$router.currentRoute.name === 'building') {
        if (this.watchName === '定制分类') {
          params.filterId = this.editJwoodInfo.filterId;
          params.customType = this.editJwoodInfo.customType;
          this.jmMiddleUpdate(params);
        } else if (this.watchName === '规则列表') {
          const p = {};
          p.userId = Number(JSON.parse(this.userInfo).userId);
          p.ruleArray = JSON.stringify(this.condition.filterCondition);
          p.mapperTagId = this.ruleInfo.mapperTagId[this.ruleInfo.mapperTagId.length - 1];
          p.renewCycle = Number(this.ruleInfo.renewCycle);
          p.mapperSystemId = this.ruleInfo.mapperSystemId;
          p.mapJudgement = this.ruleInfo.mapJudgement;
          p.id = this.ruleInfo.id;
          this.jmRulesUpdate(p);
          this.$store.state.isShow = false;
        } else {
          params.filterId = this.editJwoodInfo.filterId;
          params.customType = this.editJwoodInfo.customType;
          this.resultListUpdate(params);
        }
      } else if (this.$router.currentRoute.name === 'independent') {
        const p = {};
        p.appName = this.editJwoodInfo.appName;
        p.appCategory = this.editJwoodInfo.appCategory;
        p.referenceUrl = this.editJwoodInfo.referenceUrl;
        p.customType = this.editJwoodInfo.customType;
        p.mapperTagName = this.editJwoodInfo.mapperTagName;
        p.mapperTagId = this.editJwoodInfo.mapperTagId;
        p.userId = JSON.parse(this.userInfo).userId;
        p.id = this.editJwoodInfo.id;
        this.jmAutoMakesUpdate(p);
      }
    },
    cancel() {
      console.log(222);
    },
//  转换日期格式
    formatDate(date) {
      if (date === null) {
        return '';
      }
      const time = new Date(date);
      const Y = time.getFullYear();
      const M = time.getMonth() + 1 >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`;
      const D = time.getDate() >= 10 ? time.getDate() : `0${time.getDate()}`;
      const H = time.getHours() >= 10 ? time.getHours() : `0${time.getHours()}`;
      const m = time.getMinutes() >= 10 ? time.getMinutes() : `0${time.getMinutes()}`;
      const S = time.getSeconds() >= 10 ? time.getSeconds() : `0${time.getSeconds()}`;
      return `${Y}-${M}-${D} ${H}:${m}:${S}`;
    },
    formatDate2(date) {
      const time = new Date(date);
      const Y = time.getFullYear();
      const M = time.getMonth() + 1 >= 10 ? time.getMonth() + 1 : `0${time.getMonth() + 1}`;
      const D = time.getDate() >= 10 ? time.getDate() : `0${time.getDate()}`;
      return `${Y}-${M}-${D}`;
    },
//  平台类型转换
    formatPlatorm(platform) {
      const platforms = ['IOS', '安卓', 'IOS、安卓'];
      return platform < platforms.length + 1 ? platforms[platform - 1] : '未知';
    },
//  来源商店转换
    formatSource(sourceId) {
      const sources = ['豌豆荚', '360手机助手', '应用宝', '小米应用商店', '安智'];
      return sourceId === 0 ? '未知' : sources[sourceId - 1];
    },
//  APP状态转换
    formatAppStatus(state) {
      const states = ['未审核', '审核成功', '', '审核失败'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
    handleStatus(state) {
      const states = ['未提交', '执行中', '已完成', '执行异常'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
//  审核失败原因
    formatReason(state) {
      const states = ['校验url失败'];
      return states[state - 1] === '' ? '未知' : states[state - 1];
    },
//  table选择时触发的方法
    checkList(selection) {
      // if (selection.length) {
      //   selection.forEach((item) => {
      //     if (item.subStatus === 2) {
      //       this.$store.state.subStatus = true;
      //     }
      //   });
      // }
      this.$store.state.listArr = selection;
    },
//  改变页数的方法
    changePage(page) {
      this.$store.state.currentPage = page;
      if (this.$router.currentRoute.name === 'config') {
        if (this.configName === '1') {
          if (this.jwoodTags.length === 2) {
            this.tdTagResult();
          } else {
            this.jmTags();
          }
        } else if (this.configName === '2') {
          if (this.jwoodTags.length === 2) {
            this.jmMapperRelationsResult();
          } else {
            this.mapperImpl();
          }
        } else if (this.configName === '3') {
          this.blackList({ type: 4 });
        } else if (this.configName === '4') {
          this.blackList({ type: 5 });
        } else if (this.onfigName === '5') {
          this.blackList({ type: 1 });
        }
      }
      if (this.$router.currentRoute.name === 'sorts') {
        if (this.tags[0].name === 'BaseCode标签') {
          this.getRelationTags();
        } else if (this.tags[0].name === '标签体系') {
          if (this.tags.length === 2) {
            this.getTagSystems();
          } else {
            this.selectTags();
          }
        }
      } else if (this.$router.currentRoute.name === 'workflow') {
        this.getAPPs();
      } else if (this.$router.currentRoute.name === 'tags') {
        this.getResultData(this.resultParams);
      } else if (this.$router.currentRoute.name === 'history') {
        if (this.hitoryType === 1) {
          this.appResultHistories({ metaid: this.historyType });
        } else if (this.hitoryType === 2) {
          this.mergeHistories({ metaid: this.historyType });
        } else {
          this.getResultData();
        }
      } else if (this.$router.currentRoute.name === 'manage') {
        this.getUsers();
      } else if (this.$router.currentRoute.name === 'outcome') {
        let id;
        if (this.systemId === 0) {
          id = null;
        } else {
          id = this.systemId;
        }
        this.filterParams.systemId = id;
        this.resultList(this.filterParams);
      } else if (this.$router.currentRoute.name === 'independent') {
        this.jmAutoMakesList();
      } else if (this.$router.currentRoute.name === 'building') {
        if (this.watchName === '规则列表') {
          this.jmRulesList();
        } else if (this.watchName === '高级筛选') {
          if (this.isShow) {
            const params = {};
            params.userId = this.userInfo.userId;
            params.ruleArray = JSON.stringify(this.condition.filterCondition);
            params.mapperTagId = this.ruleInfo.mapperTagId[this.ruleInfo.mapperTagId.length - 1];
            params.mapperSystemId = this.ruleInfo.mapperSystemId;
            params.mapJudgement = this.ruleInfo.mapJudgement;
            params.renewCycle = this.ruleInfo.renewCycle;
            this.jmHighChooseAndSave(params);
          } else {
            this.jmHighChooseAndSave({ ruleArray: JSON.stringify(this.condition.filterCondition) });
          }
        } else if (this.watchName === '定制分类') {
          this.groupByMetaid(this.filterParams);
        } else if (this.watchName === '默认') {
          this.jwResultData(this.resultParams);
        } else if (this.watchName === 'result') {
          this.allResultList();
        }
      }
    },
//  标签体系状态转换
    tagSystemFormatState(state) {
      return state ? '已启用' : '未启用';
    },
//  修改状态
    changeTagstate(value) {
      this.$Message.loading({
        content: '正在处理中...',
        duration: 0,
      });
      const self = this;
      const params = {
        data: value,
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '修改成功',
          });
        },
      };
      if (value.code === undefined) {
        this.changeSystemState(params);
      } else {
        this.changeTagState(params);
      }
    },
//  修改数据
    changeTagInfo(value) {
      this.$Message.loading({
        content: '正在处理中...',
        duration: 0,
      });
      const self = this;
      const params = {
        data: value,
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '修改成功',
          });
        },
        nameError() {
          self.$Message.destroy();
          self.$Notice.error({
            title: '提示',
            desc: '名称不能重复',
          });
        },
        codeError() {
          self.$Message.destroy();
          self.$Notice.error({
            title: '提示',
            desc: 'code不能重复',
          });
        },
      };
      if (value.code === undefined) {
        this.changeSystemInfo(params);
      } else {
        this.changeTagInfoAction(params);
      }
    },
//  排序的方法
    sortList(value) {
      console.log(value);
      this.$store.state.sortObj.orderBy = value.key;
      this.$store.state.sortObj.sortBy = value.order === 'asc';
      if (this.$router.currentRoute.name === 'workflow') {
        this.getAPPs();
      } else {
        this.getResultData();
      }
    },
//  改变每页展示条数的方法
    changePageSize(value) {
      this.$store.state.pageSize = value;
      if (this.$router.currentRoute.name === 'config') {
        if (this.configName === '1') {
          if (this.jwoodTags.length === 2) {
            this.tdTagResult();
          } else {
            this.jmTags();
          }
        } else if (this.configName === '2') {
          if (this.jwoodTags.length === 2) {
            this.jmMapperRelationsResult();
          } else {
            this.mapperImpl();
          }
        } else if (this.configName === '3') {
          this.blackList({ type: 4 });
        } else if (this.configName === '4') {
          this.blackList({ type: 5 });
        } else if (this.onfigName === '5') {
          this.blackList({ type: 1 });
        }
      }
      if (this.$router.currentRoute.name === 'sorts') {
        if (this.tags[0].name === 'BaseCode标签') {
          this.getRelationTags();
        } else if (this.tags[0].name === '标签体系') {
          if (this.tags.length === 2) {
            this.getTagSystems();
          } else {
            this.selectTags();
          }
        }
      } else if (this.$router.currentRoute.name === 'workflow') {
        this.getAPPs();
      } else if (this.$router.currentRoute.name === 'tags') {
        this.getResultData(this.resultParams);
      } else if (this.$router.currentRoute.name === 'history') {
        if (this.hitoryType === 1) {
          this.appResultHistories({ metaid: this.historyType });
        } else if (this.hitoryType === 2) {
          this.mergeHistories({ metaid: this.historyType });
        } else {
          this.getResultData();
        }
      } else if (this.$router.currentRoute.name === 'manage') {
        this.getUsers();
      } else if (this.$router.currentRoute.name === 'outcome') {
        let id;
        if (this.systemId === 0) {
          id = null;
        } else {
          id = this.systemId;
        }
        this.filterParams.systemId = id;
        this.resultList(this.filterParams);
      } else if (this.$router.currentRoute.name === 'independent') {
        this.jmAutoMakesList();
      } else if (this.$router.currentRoute.name === 'building') {
        if (this.watchName === '规则列表') {
          this.jmRulesList();
        } else if (this.watchName === '高级筛选') {
          if (this.isShow) {
            const params = {};
            params.userId = this.userInfo.userId;
            params.ruleArray = JSON.stringify(this.condition.filterCondition);
            params.mapperTagId = this.ruleInfo.mapperTagId[this.ruleInfo.mapperTagId.length - 1];
            params.mapperSystemId = this.ruleInfo.mapperSystemId;
            params.mapJudgement = this.ruleInfo.mapJudgement;
            params.renewCycle = this.ruleInfo.renewCycle;
            this.jmHighChooseAndSave(params);
          } else {
            this.jmHighChooseAndSave({ ruleArray: JSON.stringify(this.condition.filterCondition) });
          }
        } else if (this.watchName === '定制分类') {
          this.groupByMetaid(this.filterParams);
        } else if (this.watchName === '默认') {
          this.jwResultData(this.resultParams);
        } else if (this.watchName === 'result') {
          this.allResultList();
        }
      }
      // if (this.$router.currentRoute.name === 'sorts') {
      //   if (this.tags[0].name === '标签体系') {
      //     if (this.tags.length === 2) {
      //       this.getTagSystems();
      //     } else {
      //       this.selectTags();
      //     }
      //   } else if (this.tags[0].name === 'BaseCode标签') {
      //     this.getRelationTags();
      //   }
      // } else if (this.$router.currentRoute.name === 'workflow') {
      //   this.getAPPs();
      // } else if (this.$router.currentRoute.name === 'tags') {
      //   this.getResultData(this.resultParams);
      // } else if (this.$router.currentRoute.name === 'manage') {
      //   this.getUsers();
      // }
    },
//  编辑弹窗的确定按钮
    editOk() {
      console.log(7777777);
      this.$Message.loading({
        content: '正在修改中...',
        duration: 0,
      });
      const self = this;
      const params = {
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '修改成功',
          });
        },
      };
    //  this.$store.state.spinShow = true;
      this.changeTagRelationPut(params);
      this.$store.state.showEditTag = false;
    },
//  编辑弹窗的取消按钮
    editCancel() {
      if (this.$router.currentRoute.name === 'workflow') {
        this.getApps();
      } else {
        this.getRelationTags();
      }
      this.$store.state.showEditTag = false;
    },
//  修改设备标签状态
    changeModelstate(value) {
      this.$Message.loading({
        content: '正在处理中...',
        duration: 0,
      });
      const self = this;
      const params = {
        data: value,
        callback() {
          self.$Message.destroy();
          self.$Notice.success({
            title: '提示',
            desc: '修改成功',
          });
        },
      };
      if (value.code === undefined) {
        this.changeSystemModelStatus(params);
      } else {
        this.changeTagModelStatus(params);
      }
    },
  },
  components: {
    edit,
    editJwood,
  },
  watch: {
    isTitle() {
      this.title = this.isTitle ? this.title3 : this.title2;
    },
    watchName() {
      if (this.watchName === '高级筛选') {
        this.title = [
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.metaid,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'metaId',
                aaa: params,
              },
            }, [
              'metaId',
            ]),
            ellipsis: true,
            width: 100,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'appCategory',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appCategory,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appCategory,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtype',
                aaa: params,
              },
            }, [
              'TDtype',
            ]),
            ellipsis: true,
          },
          {
            key: 'appDeveloper',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appDeveloper,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appDeveloper,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            ellipsis: true,
          },
          {
            key: 'referenceUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.referenceUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.referenceUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '参考网址',
                aaa: params,
              },
            }, [
              '参考网址',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新日期',
                aaa: params,
              },
            }, [
              '更新日期',
            ]),
            ellipsis: true,
          },
          {
            key: '',
            render: (h, params) => h('Button', {
              props: {
                type: 'text',
                icon: 'compose',
              },
              attrs: {
                aaa: params,
              },
              style: {
                // marginLeft: '25px',
                fontSize: '20px',
              },
              on: {
                click: () => {
                  //   体系问题
                  console.log(params.row);
                  const that = this;
                  const p = {
                    data: {
                      metaid: params.row.metaid,
                      mapperTagId: params.row.mapperTagId || '',
                      systemId: params.row.systemId,
                    },
                    callback(response) {
                      params.row.filterId = response.data;
                      that.jwoodModal = true;
                      that.$store.state.editJwoodInfo = params.row;
                    },
                  };
                  this.blackListStatus(p);
                },
              },
            }),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '编辑',
                aaa: params,
              },
            }, [
              '编辑',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.watchName === '规则列表') {
        const that = this;
        this.title = [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            key: 'mapperSystemName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.mapperSystemName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.mapperSystemName,
            ]),
            renderHeader: (h, params) => h('Select', {
              props: {
                value: this.selectVal,
                placeholder: '请选择目标体系',
                aaa: params,
              },
              on: {
                'on-change': (val) => {
                //  this.selectVal = val;
                  that.jmTdTypeData({ mapperSystemId: val });
                  this.$store.state.currentPage = 1;
                },
              },
            }, this.systemData.map((item) => {
              return h('Option', {
                props: {
                  key: item.value,
                  value: item.value,
                },
              }, [item.label]);
            })),
            ellipsis: true,
          },
          {
            key: 'mapperTagName',
            render: (h, params) => h('div', [
              h('Button', {
                props: {
                  type: 'text',
                },
                on: {
                  click: () => {
                    this.$store.state.watchName = '定制分类';
                    this.$store.state.systemId = params.row.id;
                    this.$store.state.currentPage = 1;
                    this.groupByMetaid({ ruleId: params.row.id });
                    this.mapperImplTree({ systemId: params.row.mapperSystemId });
                  },
                },
              }, [params.row.mapperTagName]),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '定制分类',
                aaa: params,
              },
            }, [
              '定制分类',
            ]),
            ellipsis: true,
          },
          {
            key: 'ruleName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.ruleName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.ruleName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '规则',
                aaa: params,
              },
            }, [
              '规则',
            ]),
            ellipsis: true,
          },
          {
            key: 'renewCycle',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.recycStatus(params.row.renewCycle),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.recycStatus(params.row.renewCycle),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '定时任务',
                aaa: params,
              },
            }, [
              '定时任务',
            ]),
            ellipsis: true,
          },
          {
            key: 'status',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.ruleStatus(params.row.status),
                class: 'ivu-table-cell-ellipsis',
                aaa: params,
              },
            }, [
              this.ruleStatus(params.row.status),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '进度',
                aaa: params,
              },
            }, [
              '进度',
            ]),
            ellipsis: true,
          },
          {
            key: 'user',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.userName,
                class: 'ivu-table-cell-ellipsis',
                aaa: params,
              },
            }, [
              params.row.userName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '制定人',
                aaa: params,
              },
            }, [
              '制定人',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '创建时间',
                aaa: params,
              },
            }, [
              '创建时间',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新时间',
                aaa: params,
              },
            }, [
              '更新时间',
            ]),
            ellipsis: true,
          },
          {
            key: '',
            // render: (h, params) => h('Button', {
            //   props: {
            //     type: 'text',
            //     icon: 'compose',
            //   },
            //   attrs: {
            //     aaa: params,
            //   },
            //   style: {
            //     // marginLeft: '25px',
            //     fontSize: '20px',
            //   },
            //   on: {
            //     click: () => {
            //       console.log(params.row);
            //       this.componentName = 'edit';
            //       this.jwoodModal = true;
            //       this.condition.filterCondition = JSON.parse(params.row.ruleArray);
            //       this.$store.state.editRuleTime = new Date();
            //       this.ruleInfo.mapperSystemId = params.row.mapperSystemId;
            //       this.ruleInfo.mapJudgement = params.row.mapJudgement;
            //       this.ruleInfo.renewCycle = params.row.renewCycle;
            //       this.ruleInfo.mapperTagId = [params.row.mapperTagId];
            //       this.ruleInfo.mapperTagName = params.row.mapperTagName;
            //       console.log(this.condition.filterCondition);
            //     },
            //   },
            // }),
            render: (h, params) => h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  icon: 'compose',
                },
                attrs: {
                  aaa: params,
                },
                style: {
                // marginLeft: '25px',
                  fontSize: '25px',
                },
                on: {
                  click: () => {
                    console.log(params.row);
                    this.componentName = 'edit';
                    this.jwoodModal = true;
                    this.condition.filterCondition = JSON.parse(params.row.ruleArray);
                    this.$store.state.editRuleTime = new Date();
                    this.ruleInfo.mapperSystemId = params.row.mapperSystemId;
                    this.ruleInfo.mapJudgement = params.row.mapJudgement;
                    this.ruleInfo.renewCycle = params.row.renewCycle;
                    this.ruleInfo.mapperTagId = [params.row.mapperTagId];
                    this.ruleInfo.mapperTagName = params.row.mapperTagName;
                    this.ruleInfo.id = params.row.id;
                    console.log(this.condition.filterCondition);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'text',
                  icon: 'ios-trash-outline',
                },
                style: {
                  marginLeft: '20px',
                  fontSize: '25px',
                },
                on: {
                  click: () => {
                    this.modal2 = true;
                    this.delId = params.row.id;
                  },
                },
              }),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '编辑',
                aaa: params,
              },
            }, [
              '编辑',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.watchName === '定制分类') {
        this.title = [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.metaid,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'metaid',
                aaa: params,
              },
            }, [
              'metaid',
            ]),
            ellipsis: true,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'mapperTagName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.mapperTagName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.mapperTagName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '定制分类',
                aaa: params,
              },
            }, [
              '定制分类',
            ]),
            ellipsis: true,
          },
          {
            key: 'appCategory',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appCategory,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appCategory,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtype',
                aaa: params,
              },
            }, [
              'TDtype',
            ]),
            ellipsis: true,
          },
          {
            key: 'appDeveloper',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appDeveloper,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appDeveloper,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            ellipsis: true,
          },
          {
            key: 'referenceUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.referenceUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.referenceUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '参考网址',
                aaa: params,
              },
            }, [
              '参考网址',
            ]),
            ellipsis: true,
          },
          // {
          //   key: 'referenceUrl',
          //   render: (h, params) => h('Tooltip', {
          //     attrs: {
          //       content: params.row.referenceUrl,
          //       class: 'ivu-table-cell-ellipsis',
          //     },
          //   }, [
          //     params.row.referenceUrl,
          //   ]),
          //   renderHeader: (h, params) => h('Tooltip', {
          //     attrs: {
          //       content: 'APP更新日期',
          //       aaa: params,
          //     },
          //   }, [
          //     'APP更新日期',
          //   ]),
          //   ellipsis: true,
          // },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '创建时间',
                aaa: params,
              },
            }, [
              '创建时间',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新日期',
                aaa: params,
              },
            }, [
              '更新日期',
            ]),
            ellipsis: true,
          },
          {
            key: 'user',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.userName,
                class: 'ivu-table-cell-ellipsis',
                aaa: params,
              },
            }, [
              params.row.userName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '操作人',
                aaa: params,
              },
            }, [
              '操作人',
            ]),
            ellipsis: true,
          },
          {
            key: 'customType',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.customType,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.customType,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '定制类型',
                aaa: params,
              },
            }, [
              '定制类型',
            ]),
            ellipsis: true,
          },
          {
            key: '',
            render: (h, params) => h('Button', {
              props: {
                type: 'text',
                icon: 'compose',
              },
              attrs: {
                aaa: params,
              },
              style: {
                // marginLeft: '25px',
                fontSize: '20px',
              },
              on: {
                click: () => {
                  console.log(params.row);
                  const that = this;
                  const p = {
                    data: {
                      metaid: params.row.metaid,
                      mapperTagId: params.row.mapperTagId || '',
                      systemId: params.row.systemId,
                    },
                    callback(response) {
                      params.row.filterId = response.data;
                      that.jwoodModal = true;
                      that.$store.state.editJwoodInfo = params.row;
                    },
                  };
                  this.blackListStatus(p);
                },
              },
            }),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '编辑',
                aaa: params,
              },
            }, [
              '编辑',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.watchName === '默认' || this.watchName === '新建') {
        this.title = [
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.metaid,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'metaId',
                aaa: params,
              },
            }, [
              'metaId',
            ]),
            ellipsis: true,
            width: 100,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appName,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'appCategory',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appCategory,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appCategory,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtype',
                aaa: params,
              },
            }, [
              'TDtype',
            ]),
            ellipsis: true,
          },
          {
            key: 'appDeveloper',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appDeveloper,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.appDeveloper,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            ellipsis: true,
          },
          {
            key: 'referenceUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.referenceUrl,
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              params.row.referenceUrl,
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '参考网址',
                aaa: params,
              },
            }, [
              '参考网址',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新日期',
                aaa: params,
              },
            }, [
              '更新日期',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.watchName === 'result') {
        this.title = [
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
              },
            }, [params.row.metaid]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: 'metaid',
              },
            }, 'metaid'),
            ellipsis: true,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
              },
            }, [params.row.appName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'mapperTagName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.mapperTagName,
              },
            }, [params.row.mapperTagName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '定制分类',
                aaa: params,
              },
            }, [
              '定制分类',
            ]),
            ellipsis: true,
          },
          {
            key: 'appCategory',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appCategory,
              },
            }, params.row.appCategory),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtype',
                aaa: params,
              },
            }, [
              'TDtype',
            ]),
            ellipsis: true,
          },
          {
            key: 'pkgName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgName,
              },
            }, params.row.pkgName),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名',
                aaa: params,
              },
            }, [
              '包名',
            ]),
            ellipsis: true,
          },
          {
            key: 'pkgHash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgHash,
              },
            }, params.row.pkgHash),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'hash',
                aaa: params,
              },
            }, [
              'hash',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
              },
            }, this.formatDate(params.row.createTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '创建时间',
                aaa: params,
              },
            }, [
              '创建日期',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
              },
            }, this.formatDate(params.row.updateTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新时间',
                aaa: params,
              },
            }, [
              '更新时间',
            ]),
            ellipsis: true,
          },
          {
            key: 'customType',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.customType,
              },
            }, params.row.customType),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '定制类型',
                aaa: params,
              },
            }, [
              '定制类型',
            ]),
            ellipsis: true,
          },
          {
            key: 'userName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.userName,
              },
            }, params.row.userName),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '操作人',
                aaa: params,
              },
            }, [
              '操作人',
            ]),
            ellipsis: true,
          },
          {
            key: '',
            render: (h, params) => h('Button', {
              props: {
                type: 'text',
                icon: 'compose',
              },
              attrs: {
                aaa: params,
              },
              style: {
                // marginLeft: '25px',
                fontSize: '20px',
              },
              on: {
                click: () => {
                  const that = this;
                  const p = {
                    data: {
                      metaid: params.row.metaid,
                      mapperTagId: params.row.mapperTagId,
                      systemId: params.row.systemId,
                    },
                    callback(response) {
                      params.row.filterId = response.data;
                      that.jwoodModal = true;
                      that.$store.state.editJwoodInfo = params.row;
                    },
                  };
                  this.blackListStatus(p);
                  this.mapperImplTree({ systemId: params.row.systemId });
                //  params.row.s = 1;
                },
              },
            }),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '编辑',
                aaa: params,
              },
            }, [
              '编辑',
            ]),
            ellipsis: true,
          },
        ];
      }
    },
    historyType() {
      if (this.historyType === 1) {
        this.title = [
          {
            key: 'Metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
              },
            }, [params.row.metaid]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: 'metaid',
              },
            }, 'metaid'),
            ellipsis: true,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
              },
            }, [params.row.appName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'APP名称',
                aaa: params,
              },
            }, [
              'APP名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'pkgName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgName,
              },
            }, [params.row.pkgName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '包名',
                aaa: params,
              },
            }, [
              '包名',
            ]),
            ellipsis: true,
          },
          {
            key: 'appCategory',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appCategory,
              },
            }, [params.row.appCategory]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TD分类',
                aaa: params,
              },
            }, [
              'TD分类',
            ]),
            ellipsis: true,
          },
          {
            key: 'appIconurl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appIconurl,
              },
            }, params.row.appIconurl),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '图标地址',
                aaa: params,
              },
            }, [
              '图标地址',
            ]),
            ellipsis: true,
          },
          {
            key: 'appDeveloper',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appDeveloper,
              },
            }, params.row.appDeveloper),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者',
                aaa: params,
              },
            }, [
              '开发者',
            ]),
            ellipsis: true,
          },
          {
            key: 'referenceUrl',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.referenceUrl,
              },
            }, params.row.referenceUrl),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '参考网址',
                aaa: params,
              },
            }, [
              '参考网址',
            ]),
            ellipsis: true,
          },
          {
            key: 'appNameSpell',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameSpell,
              },
            }, params.row.appNameSpell),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称PY',
                aaa: params,
              },
            }, [
              '名称PY',
            ]),
            ellipsis: true,
          },
          {
            key: 'appNameEn',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appNameEn,
              },
            }, params.row.appNameEn),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称EN',
                aaa: params,
              },
            }, [
              '名称EN',
            ]),
            ellipsis: true,
          },
          {
            key: 'appDeveloperEn',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appDeveloperEn,
              },
            }, params.row.appDeveloperEn),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '开发者EN',
                aaa: params,
              },
            }, [
              '开发者EN',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.updateTime,
              },
            }, params.row.updateTime),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '更新时间',
                aaa: params,
              },
            }, [
              '更新时间',
            ]),
            ellipsis: true,
          },
          {
            key: 'operator',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.operator,
              },
            }, params.row.operator),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '作业员',
                aaa: params,
              },
            }, [
              '作业员',
            ]),
            ellipsis: true,
          },
          {
            key: 'merge',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.merge,
              },
            }, params.row.merge),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '合包条数',
                aaa: params,
              },
            }, [
              '合包条数',
            ]),
            ellipsis: true,
          },
          {
            key: 'pkgNames',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgNames,
              },
            }, params.row.pkgNames),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '全部包名',
                aaa: params,
              },
            }, [
              '全部包名',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.historyType === 2) {
        this.title = [
          {
            key: 'pkgName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.pkgName,
              },
            }, [params.row.pkgName]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: 'metaid',
              },
            }, '包名'),
            ellipsis: true,
          },
          {
            key: 'hash',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.hash,
              },
            }, [params.row.hash]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'hash',
                aaa: params,
              },
            }, [
              'hash',
            ]),
            ellipsis: true,
          },
          {
            key: 'name',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.name,
              },
            }, [params.row.name]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'APP名称',
                aaa: params,
              },
            }, [
              'APP名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
              },
            }, params.row.metaid),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'Metaid',
                aaa: params,
              },
            }, [
              'Metaid',
            ]),
            ellipsis: true,
          },
          {
            key: 'type',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatType(params.row.type),
              },
            }, this.formatType(params.row.type)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '合包方式',
                aaa: params,
              },
            }, [
              '合包方式',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
              },
            }, this.formatDate(params.row.createTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'metaid更新时间',
                aaa: params,
              },
            }, [
              'metaid更新时间',
            ]),
            ellipsis: true,
          },
        ];
      }
    },
    stepVal() {
      this.$store.state.currentPage = 1;
      this.$store.state.listArr = [];
//    进行列表title的动态渲染
      if (this.$router.currentRoute.name === 'workflow') {
        if (this.stepVal === 0) {
          this.title = [
            {
              type: 'selection',
              width: 34,
              align: 'center',
            },
            {
              key: 'appOriginalName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.appOriginalName,
                },
              }, [
                params.row.appOriginalName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '原始名称',
                  aaa: params,
                },
              }, [
                '原始名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'appPackageName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.appPackageName,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.appPackageName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包名',
                  aaa: params,
                },
              }, [
                '包名',
              ]),
              ellipsis: true,
            },
            {
              key: 'packageHash',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.packageHash,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.packageHash,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'Hash',
                  aaa: params,
                },
              }, [
                'Hash',
              ]),
              ellipsis: true,
            },
            {
              key: 'platform',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatPlatorm(params.row.platform),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatPlatorm(params.row.platform),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '平台',
                  aaa: params,
                },
              }, [
                '平台',
              ]),
              ellipsis: true,
              width: 70,
            },
            {
              key: 'preAppName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.preAppName,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.preAppName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包名称',
                  aaa: params,
                },
              }, [
                '包名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'packageStatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.handleState(params.row.packageStatus),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.handleState(params.row.packageStatus),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '状态',
                  aaa: params,
                },
              }, [
                '状态',
              ]),
              ellipsis: true,
              width: 100,
            },
            {
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.createTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包获取日期',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                '包获取日期',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
            // {
            //   key: 'updateTime',
            //   render: (h, params) => h('Tooltip', {
            //     attrs: {
            //       content: this.formatDate(params.row.updateTime),
            //       class: 'ivu-table-cell-ellipsis',
            //     },
            //   }, [
            //     this.formatDate(params.row.updateTime),
            //   ]),
            //   renderHeader: (h, params) => h('Tooltip', {
            //     attrs: {
            //       content: '包最近更新时间',
            //       aaa: params,
            //     },
            //     class: 'creat-time',
            //   }, [
            //     '包最近更新时间',
            //   ]),
            //   ellipsis: true,
            //   sortable: 'custom',
            //   width: 160,
            // },
          ];
        } else if (this.stepVal === 1) {
//          this.title = [];
        } else if (this.stepVal === 2) {
//          this.title = [];
        } else if (this.stepVal === 3) {
//          this.title = [];
        } else if (this.stepVal === 4) {
          this.title2 = [
            {
              type: 'selection',
              width: 34,
              align: 'center',
            },
            {
              key: 'appName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.appName,
                },
              }, [
                params.row.appName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包名称',
                  aaa: params,
                },
              }, [
                '包名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'appPackageName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.appPackageName,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.appPackageName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包名',
                  aaa: params,
                },
              }, [
                '包名',
              ]),
              ellipsis: true,
            },
            {
              key: 'packageHash',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.packageHash,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.packageHash,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'Hash',
                  aaa: params,
                },
              }, [
                'Hash',
              ]),
              ellipsis: true,
            },
            {
              key: 'pkgTagName',
              render: (h, params) => h('Tooltip', [
                h('p', params.row.pkgTagName),
                h('div', {
                  slot: 'content',
                },
                  String(params.row.pkgTagName).split(',').map(pkg => h('p', pkg)),
              ),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '分类',
                  aaa: params,
                },
              }, [
                '分类',
              ]),
              ellipsis: true,
            },
            {
              key: 'iconUrl',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.iconUrl,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.iconUrl,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '图标地址',
                  aaa: params,
                },
              }, [
                '图标地址',
              ]),
              ellipsis: true,
            },
            {
              key: 'developer',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.developer,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.developer,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '开发者',
                  aaa: params,
                },
              }, [
                '开发者',
              ]),
              ellipsis: true,
            },
            {
              key: 'sourceId',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatSource(params.row.sourceId),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatSource(params.row.sourceId),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '来源商店',
                  aaa: params,
                },
              }, [
                '来源商店',
              ]),
              ellipsis: true,
            },
            {
              key: 'metaId',
              render: (h, params) => h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      const data = {
                        data: params.row,
                      };
                      this.$store.state.dataDetails = [];
                      this.$store.state.showDetails = true;
                    //  this.editData = { ...this.editData, data: params.row };
                //    this.editData.data = params.row;
                      this.$store.state.editData = data;
                      this.getMetaIdDetails(data);
                    },
                  },
                }, [params.row.metaId === 0 ? '' : params.row.metaId]),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'MetaID',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                'MetaID',
              ]),
              ellipsis: true,
              sortable: 'custom',
            },
            {
              key: 'packageStatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.handleState(params.row.packageStatus),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.handleState(params.row.packageStatus),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包状态',
                  aaa: params,
                },
              }, [
                '包状态',
              ]),
              ellipsis: true,
              width: 100,
            },
            {
              key: 'substatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.handleStatus(params.row.substatus),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.handleStatus(params.row.substatus),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '提交状态',
                  aaa: params,
                },
              }, [
                '提交状态',
              ]),
              ellipsis: true,
              width: 100,
            },
            {
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.createTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包获取日期',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                '包获取日期',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
            {
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.updateTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包最近更新时间',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                '包最近更新时间',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
          ];
          this.title3 = [
            {
              type: 'selection',
              width: 34,
              align: 'center',
            },
            {
              key: 'appName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.appName,
                },
              }, [
                params.row.appName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包名称',
                  aaa: params,
                },
              }, [
                '包名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'appPackageName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.appPackageName,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.appPackageName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包名',
                  aaa: params,
                },
              }, [
                '包名',
              ]),
              ellipsis: true,
            },
            {
              key: 'packageHash',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.packageHash,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.packageHash,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'Hash',
                  aaa: params,
                },
              }, [
                'Hash',
              ]),
              ellipsis: true,
            },
            {
              key: 'pkgTagName',
              render: (h, params) => {
                const tmp = [];
                const tmp2 = [];
                const tmp3 = [];
                const val = params.row.pkgDetails;
                if (val !== null && val !== undefined) {
                //  console.log(val);
                  val.forEach((todo) => {
                    if (todo.sourceName === 'BaseType') {
                      tmp.push(todo.pkgName);
                    } else if (todo.sourceName === 'TD分类') {
                      tmp2.push(todo.pkgName);
                    } else {
                      tmp3.push(todo.pkgName);
                    }
                  });
                }
                return h('Tooltip', [
                  h('p', tmp2.join(',')),
                  h('div', {
                    slot: 'content',
                  },
                    tmp2.map(pkg => h('p', pkg)),
                  ),
                ]);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '分类',
                  aaa: params,
                },
              }, [
                '分类',
              ]),
              ellipsis: true,
            },
            {
              key: 'iconUrl',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.iconUrl,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.iconUrl,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '图标地址',
                  aaa: params,
                },
              }, [
                '图标地址',
              ]),
              ellipsis: true,
            },
            {
              key: 'developer',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.developer,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.developer,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '开发者',
                  aaa: params,
                },
              }, [
                '开发者',
              ]),
              ellipsis: true,
            },
            {
              key: 'developer',
              render: (h, params) => h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      const data = {
                        data: params.row,
                      };
                      console.log(params.row);
                      this.$store.state.dataDetail = '预测详情';
                      this.$store.state.metaDetail = '文本预测';
                      this.$store.state.dataDetails = [];
                      this.$store.state.dataDetails.push(params.row);
                      this.$store.state.showDetails = true;
                      this.$store.state.editData = data;
                      this.forecastDetails(data);
                    },
                  },
                }, [params.row.forecast]),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '预测状态',
                  aaa: params,
                },
              }, [
                '预测状态',
              ]),
              ellipsis: true,
            },
            {
              key: 'sourceId',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatSource(params.row.sourceId),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatSource(params.row.sourceId),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '来源商店',
                  aaa: params,
                },
              }, [
                '来源商店',
              ]),
              ellipsis: true,
            },
            {
              key: 'metaId',
              render: (h, params) => h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      const data = {
                        data: params.row,
                      };
                      this.$store.state.dataDetails = [];
                      this.$store.state.showDetails = true;
                      this.$store.state.dataDetail = '数据详情';
                      this.$store.state.metaDetail = '匹配详情';
                    //  this.editData = { ...this.editData, data: params.row };
                //    this.editData.data = params.row;
                      this.$store.state.editData = data;
                      this.getMetaIdDetails(data);
                    },
                  },
                }, [params.row.metaId === 0 ? '' : params.row.metaId]),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'MetaID',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                'MetaID',
              ]),
              ellipsis: true,
              sortable: 'custom',
            },
            {
              key: 'packageStatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.handleState(params.row.packageStatus),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.handleState(params.row.packageStatus),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包状态',
                  aaa: params,
                },
              }, [
                '包状态',
              ]),
              ellipsis: true,
              width: 100,
            },
            {
              key: 'substatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.handleStatus(params.row.substatus),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.handleStatus(params.row.substatus),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '提交状态',
                  aaa: params,
                },
              }, [
                '提交状态',
              ]),
              ellipsis: true,
              width: 100,
            },
            {
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.createTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包获取日期',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                '包获取日期',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
            {
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.updateTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '包最近更新时间',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                '包最近更新时间',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
          ];
          this.title = this.title3;
        } else if (this.stepVal === 5) {
          const self = this;
          this.tagObj.filterMethod = (value) => {
            if (value === 1) {
              self.tagObj.render = (h, params) => {
                const tmp = [];
                const tmp2 = [];
                const tmp3 = [];
                if (params.row.pkgDetails) {
                  params.row.pkgDetails.forEach((todo) => {
                    if (todo.sourceName === 'BaseType') {
                      tmp.push(todo.pkgName);
                    } else if (todo.sourceName === 'TD分类') {
                      tmp2.push(todo.pkgName);
                    } else {
                      tmp3.push(todo.pkgName);
                    }
                  });
                }
                return h('Tooltip', [
                  h('p', tmp.join(',')),
                  h('div', {
                    slot: 'content',
                  },
                    tmp.map(pkg => h('p', pkg)),
                  ),
                ]);
              };
            } else if (value === 2) {
              self.tagObj.render = (h, params) => {
                const tmp = [];
                const tmp2 = [];
                const tmp3 = [];
                if (params.row.pkgDetails) {
                  params.row.pkgDetails.forEach((todo) => {
                    if (todo.sourceName === 'BaseType') {
                      tmp.push(todo.pkgName);
                    } else if (todo.sourceName === 'TD分类') {
                      tmp2.push(todo.pkgName);
                    } else {
                      tmp3.push(todo.pkgName);
                    }
                  });
                }
                return h('Tooltip', [
                  h('p', tmp2.join(',')),
                  h('div', {
                    slot: 'content',
                  },
                    tmp2.map(pkg => h('p', pkg)),
                  ),
                ]);
              };
            } else {
              self.tagObj.render = (h, params) => {
                const tmp = [];
                const tmp2 = [];
                const tmp3 = [];
                if (params.row.pkgDetails) {
                  params.row.pkgDetails.forEach((todo) => {
                    if (todo.sourceName === 'BaseType') {
                      tmp.push(todo.pkgName);
                    } else if (todo.sourceName === 'TD分类') {
                      tmp2.push(todo.pkgName);
                    } else {
                      tmp3.push(todo.pkgName);
                    }
                  });
                }
                return h('Tooltip', [
                  h('p', tmp3.join(',')),
                  h('div', {
                    slot: 'content',
                  },
                    tmp3.map(pkg => h('p', pkg)),
                  ),
                ]);
              };
            }
          };
          this.title = [
            {
              type: 'selection',
              width: 34,
              align: 'center',
            },
            {
              key: 'metaId',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.metaId === 0 ? '' : params.row.metaId,
                },
              }, [
                params.row.metaId === 0 ? '' : params.row.metaId,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'MetaID',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                'MetaID',
              ]),
              ellipsis: true,
              sortable: 'custom',
            },
            {
              key: 'standardName',
              render: (h, params) => h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small',
                  },
                  on: {
                    click: () => {
                      this.$store.state.dataDetails = [];
                      this.$store.state.showDetails = true;
                      this.$store.state.dataDetails.push(params.row);
                    },
                  },
                }, params.row.standardName),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'App标准名称',
                  aaa: params,
                },
              }, [
                'App标准名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'standardNameEn',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.standardNameEn,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.standardNameEn,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '标准英文名称',
                  aaa: params,
                },
              }, [
                '标准英文名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'standardNameSpell',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.standardNameSpell,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.standardNameSpell,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '标准名称拼音',
                  aaa: params,
                },
              }, [
                '标准名称拼音',
              ]),
              ellipsis: true,
            },
            this.tagObj,
            {
              key: 'platform',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatPlatorm(params.row.platform),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatPlatorm(params.row.platform),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '平台',
                  aaa: params,
                },
              }, [
                '平台',
              ]),
              ellipsis: true,
              width: 70,
            },
            {
              key: 'finalIconUrl',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.finalIconUrl,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.finalIconUrl,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '最终图标地址',
                  aaa: params,
                },
              }, [
                '最终图标地址',
              ]),
              ellipsis: true,
            },
            {
              key: 'appStatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatAppStatus(params.row.appStatus),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatAppStatus(params.row.appStatus),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'App状态',
                  aaa: params,
                },
              }, [
                'App状态',
              ]),
              ellipsis: true,
              width: 70,
            },
            {
              key: 'reason',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatReason(params.row.reason),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatReason(params.row.reason),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '失败原因',
                  aaa: params,
                },
              }, [
                '失败原因',
              ]),
              ellipsis: true,
              width: 70,
            },
            {
              key: 'userName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.userName,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.userName,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '作业员',
                  aaa: params,
                },
              }, [
                '作业员',
              ]),
              ellipsis: true,
              width: 70,
            },
            {
              align: 'center',
              key: 'merge',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.merge,
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                params.row.merge,
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '合包条数',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                '合包条数',
              ]),
              ellipsis: true,
              sortable: 'custom',
            },
            {
              key: 'addTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.addTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.addTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'Metaid添加日期',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                'Metaid添加日期',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
            {
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.updateTime),
              ]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'App最后更新时间',
                  aaa: params,
                },
                class: 'creat-time',
              }, [
                'App最后更新时间',
              ]),
              ellipsis: true,
              sortable: 'custom',
              width: 160,
            },
            {
              title: '编辑',
              key: 'edit',
              render: (h, params) => h('Button', {
                props: {
                  type: 'text',
                  icon: 'compose',
                },
                style: {
                  fontSize: '22px',
                },
                on: {
                  click: () => {
                    this.$store.state.showEdit = true;
                    this.$store.state.editAppInfo = params.row;
                  },
                },
              }),
              ellipsis: true,
              width: 50,
            },
          ];
        }
      }
    },
    jwoodTags() {
      if (this.configName === '1') {
        if (this.jwoodTags.length !== 2) {
          // this.title = [
          //   {
          //     type: 'selection',
          //     width: 60,
          //     align: 'center',
          //   },
          //   {
          //     key: 'sid',
          //     render: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: params.row.sid,
          //       },
          //     }, [params.row.sid]),
          //     renderHeader: h => h('Tooltip', {
          //       attrs: {
          //         content: '标签id',
          //       },
          //     }, '标签id'),
          //     ellipsis: true,
          //   },
          //   {
          //     key: 'name',
          //     render: (h, params) => {
          //       const p = params;
          //       if (params.row.id === this.editKey) {
          //         return h('Input', {
          //           props: {
          //             value: params.row.name,
          //             autofocus: true,
          //           },
          //           on: {
          //             input: (val) => {
          //               p.row.name = val;
          //             },
          //           },
          //         });
          //       }
          //       return h('div', [
          //         h('span', {
          //           style: {
          //             cursor: 'pointer',
          //           },
          //           on: {
          //             click: () => {
          //               this.jwoodTags.pop();
          //               this.jwoodTags.push(params.row);
          //               this.jwoodTags.push('');
          //               this.$store.state.groupId = params.row.id;
          //               console.log(this.$store.state.parentcode);
          //             },
          //           },
          //         }, [h('Tooltip', {
          //           attrs: {
          //             content: params.row.name,
          //           },
          //         }, [params.row.name])]),
          //       ]);
          //     },
          //     renderHeader: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: '标签',
          //         aaa: params,
          //       },
          //     }, [
          //       '标签',
          //     ]),
          //     ellipsis: true,
          //   },
          //   {
          //     key: 'code',
          //     render: (h, params) => {
          //       const p = params;
          //       if (params.row.id === this.editKey) {
          //         return h('Input', {
          //           props: {
          //             value: params.row.code,
          //             autofocus: true,
          //           },
          //           on: {
          //             input: (val) => {
          //               p.row.code = val;
          //             },
          //           },
          //         });
          //       }
          //       return h('Tooltip', {
          //         attrs: {
          //           content: params.row.code,
          //         },
          //       }, params.row.code);
          //     },
          //     renderHeader: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: '标签code',
          //         aaa: params,
          //       },
          //     }, [
          //       '标签code',
          //     ]),
          //     ellipsis: true,
          //   },
          //   {
          //     key: 'description',
          //     render: (h, params) => {
          //       const p = params;
          //       if (params.row.id === this.editKey) {
          //         return h('Input', {
          //           props: {
          //             value: params.row.description,
          //             autofocus: true,
          //           },
          //           on: {
          //             input: (val) => {
          //               p.row.description = val;
          //             },
          //           },
          //         });
          //       }
          //       return h('Tooltip', {
          //         attrs: {
          //           content: params.row.description,
          //         },
          //       }, params.row.description);
          //     },
          //     renderHeader: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: '标签描述',
          //         aaa: params,
          //       },
          //     }, [
          //       '标签描述',
          //     ]),
          //     ellipsis: true,
          //   },
          //   {
          //     key: 'createTime',
          //     render: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: this.formatDate(params.row.createTime),
          //       },
          //     }, this.formatDate(params.row.createTime)),
          //     renderHeader: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: '添加时间',
          //         aaa: params,
          //       },
          //     }, [
          //       '添加时间',
          //     ]),
          //     ellipsis: true,
          //   },
          //   {
          //     key: 'updateTime',
          //     render: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: this.formatDate(params.row.updateTime),
          //       },
          //     }, this.formatDate(params.row.updateTime)),
          //     renderHeader: (h, params) => h('Tooltip', {
          //       attrs: {
          //         content: '更新时间',
          //         aaa: params,
          //       },
          //     }, [
          //       '更新时间',
          //     ]),
          //     ellipsis: true,
          //   },
          //   {
          //     title: '操作',
          //     key: '',
          //     render: (h, params) => {
          //       if (params.row.id === this.editKey) {
          //         return h('div', {
          //           style: {
          //             fontSize: '12px',
          //           },
          //         }, [
          //           h('span', {
          //             style: {
          //               marginLeft: '5px',
          //               cursor: 'pointer',
          //             },
          //             on: {
          //               click: () => {
          //                 this.jwoodjmTagsUpdate(params.row);
          //                 this.editKey = '';
          //               },
          //             },
          //           }, '确定'),
          //           h('span', {
          //             style: {
          //               marginLeft: '5px',
          //               cursor: 'pointer',
          //             },
          //             on: {
          //               click: () => {
          //                 this.editKey = '';
          //               },
          //             },
          //           }, '取消'),
          //         ]);
          //       }
          //       return h('div', [
          //         h('i-switch', {
          //           attrs: {
          //             value: true,
          //           },
          //           nativeOn: {
          //             click: () => {
          //               console.log(111);
          //             },
          //           },
          //         }),
          //         h('Button', {
          //           props: {
          //             type: 'text',
          //             icon: 'compose',
          //           },
          //           style: {
          //             fontSize: '20px',
          //             marginLeft: '20px',
          //           },
          //           on: {
          //             click: () => {
          //               this.editKey = params.row.id;
          //             },
          //           },
          //         }),
          //       ]);
          //     },
          //     ellipsis: true,
          //   },
          //   {
          //     title: '设备标签',
          //     key: 'a',
          //     render: (h, params) => h('div', [
          //       h('i-switch', {
          //         attrs: {
          //           value: true,
          //         },
          //         nativeOn: {
          //           click: () => {
          //             console.log(params.row);
          //           },
          //         },
          //       }),
          //     ]),
          //   },
          // ];
        } else {
          this.$store.state.modify = false;
          this.title = [
            {
              type: 'selection',
              width: 60,
              align: 'center',
            },
            {
              key: 'id',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.id,
                },
              }, [params.row.id]),
              renderHeader: h => h('Tooltip', {
                attrs: {
                  content: '体系id',
                },
              }, '体系id'),
              ellipsis: true,
            },
            {
              key: 'name',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.name,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.name = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('span', {
                    style: {
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                        this.jwoodTags.pop();
                        this.jwoodTags.push(params.row);
                        this.jwoodTags.push('');
                        this.$store.state.groupId = params.row.id;
                        this.$store.state.modify = true;
                      //  this.$store.state.parentcode = '';
                      //  this.jmTags();
                      },
                    },
                  }, [h('Tooltip', {
                    attrs: {
                      content: params.row.name,
                    },
                  }, [params.row.name])]),
                ]);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '体系名称',
                  aaa: params,
                },
              }, [
                '体系名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'description',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.description,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.description = val;
                      },
                    },
                  });
                }
                return h('Tooltip', {
                  attrs: {
                    content: params.row.description,
                  },
                }, params.row.description);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '描述',
                  aaa: params,
                },
              }, [
                '描述',
              ]),
              ellipsis: true,
            },
            {
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                },
              }, this.formatDate(params.row.createTime)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '创建日期',
                  aaa: params,
                },
              }, [
                '创建日期',
              ]),
              ellipsis: true,
            },
            {
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                },
              }, this.formatDate(params.row.updateTime)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '更新日期',
                  aaa: params,
                },
              }, [
                '更新日期',
              ]),
              ellipsis: true,
            },
            {
              key: 'userName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.userName,
                },
              }, params.row.userName),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '操作人',
                  aaa: params,
                },
              }, [
                '操作人',
              ]),
              ellipsis: true,
            },
            {
              title: '操作',
              key: '',
              render: (h, params) => {
                if (params.row.id === this.editKey) {
                  return h('div', {
                    style: {
                      fontSize: '12px',
                    },
                  }, [
                    h('span', {
                      style: {
                        marginLeft: '5px',
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          console.log(params.row);
                          this.jwoodUpdate(params.row);
                          this.editKey = '';
                        },
                      },
                    }, '确定'),
                    h('span', {
                      style: {
                        marginLeft: '5px',
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          this.editKey = '';
                        },
                      },
                    }, '取消'),
                  ]);
                }
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'compose',
                    },
                    style: {
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        this.editKey = params.row.id;
                      },
                    },
                  }),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '版本变更记录',
              key: '',
              render: (h, params) => h('Button', {
                props: {
                  type: 'text',
                },
                style: {
                  color: 'blue',
                },
                on: {
                  click: () => {
                    this.$emit('scan', params.row.id);
                  },
                },
              }, ['查看']),
            },
          ];
        }
      } else if (this.configName === '2') {
        this.$store.state.modify = false;
        if (this.jwoodTags.length !== 2) {
          this.title = [
            {
              type: 'selection',
              width: 60,
              align: 'center',
            },
            {
              key: 'id',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.id,
                },
              }, [params.row.id]),
              renderHeader: h => h('Tooltip', {
                attrs: {
                  content: 'ID',
                },
              }, 'Id'),
              ellipsis: true,
            },
            {
              key: 'tdtypeCode',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.tdtypeCode,
                },
              }, [params.row.tdtypeCode]),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'TDtypecode',
                  aaa: params,
                },
              }, [
                'TDtypecode',
              ]),
              ellipsis: true,
            },
            {
              key: 'tdtypeName',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.tdtypeName,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.tdtypeName = val;
                      },
                    },
                  });
                }
                return h('Tooltip', {
                  attrs: {
                    content: params.row.tdtypeName,
                  },
                }, params.row.tdtypeName);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'TDtype',
                  aaa: params,
                },
              }, [
                'TDtype',
              ]),
              ellipsis: true,
            },
            {
              key: 'tdtagCode',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.tdtagCode,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.tdtagCode = val;
                      },
                    },
                  });
                }
                return h('Tooltip', {
                  attrs: {
                    content: params.row.tdtagCode,
                  },
                }, params.row.tdtagCode);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'TDtagcode',
                  aaa: params,
                },
              }, [
                'TDtagcode',
              ]),
              ellipsis: true,
            },
            {
              key: 'tdtagName',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.tdtagName,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.tdtagName = val;
                      },
                    },
                  });
                }
                return h('Tooltip', {
                  attrs: {
                    content: params.row.tdtagName,
                  },
                }, params.row.tdtagName);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'TDtag',
                  aaa: params,
                },
              }, [
                'TDtag',
              ]),
              ellipsis: true,
            },
            {
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                },
              }, this.formatDate(params.row.createTime)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'create_time',
                  aaa: params,
                },
              }, [
                'create_time',
              ]),
              ellipsis: true,
            },
            {
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                },
              }, this.formatDate(params.row.updateTime)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: 'update_time',
                  aaa: params,
                },
              }, [
                'update_time',
              ]),
              ellipsis: true,
            },
            {
              title: '操作',
              key: '',
              render: (h, params) => {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'compose',
                    },
                    style: {
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        console.log(params.row);
                        this.tdtypeData.tdtypeVal = params.row.tdtypeName;
                        this.tdtypeData.mapperVal = params.row.tdtagName;
                        this.tdtypeData.id = params.row.id;
                        this.$store.state.showUpdate = !this.$store.state.showUpdate;
                      //  console.log(this.$store.state.showConfig);
                      },
                    },
                  }),
                ]);
              },
              ellipsis: true,
            },
          ];
        } else {
          this.title = [
            {
              type: 'selection',
              width: 60,
              align: 'center',
            },
            {
              key: 'id',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.id,
                },
              }, [params.row.id]),
              renderHeader: h => h('Tooltip', {
                attrs: {
                  content: 'id',
                },
              }, 'id'),
              ellipsis: true,
            },
            {
              key: 'mapppingName',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.mapppingName,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.mapppingName = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('span', {
                    style: {
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                        const pa = {};
                        pa.systemId = params.row.systemId;
                        this.jwoodTags.pop();
                        this.jwoodTags.push(params.row);
                        this.jwoodTags.push('');
                        this.mapperImplTree(pa);
                        this.$store.state.groupId = params.row.id;
                      },
                    },
                  }, [h('Tooltip', {
                    attrs: {
                      content: params.row.mapppingName,
                    },
                  }, [params.row.mapppingName])]),
                ]);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '体系名称',
                  aaa: params,
                },
              }, [
                '体系名称',
              ]),
              ellipsis: true,
            },
            {
              key: 'mapppingDescribe',
              render: (h, params) => {
                const p = params;
                if (params.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: params.row.mapppingDescribe,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.mapppingDescribe = val;
                      },
                    },
                  });
                }
                return h('Tooltip', {
                  attrs: {
                    content: params.row.mapppingDescribe,
                  },
                }, params.row.mapppingDescribe);
              },
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '描述',
                  aaa: params,
                },
              }, [
                '描述',
              ]),
              ellipsis: true,
            },
            {
              key: 'mappingStates',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.mappingStatus(params.row.mappingStates),
                },
              }, this.mappingStatus(params.row.mappingStates)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '状态',
                  aaa: params,
                },
              }, [
                '状态',
              ]),
              ellipsis: true,
            },
            {
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                },
              }, this.formatDate(params.row.createTime)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '创建日期',
                  aaa: params,
                },
              }, [
                '创建日期',
              ]),
              ellipsis: true,
            },
            {
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                },
              }, this.formatDate(params.row.updateTime)),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '更新日期',
                  aaa: params,
                },
              }, [
                '更新日期',
              ]),
              ellipsis: true,
            },
            {
              key: 'userName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.userName,
                },
              }, params.row.userName),
              renderHeader: (h, params) => h('Tooltip', {
                attrs: {
                  content: '操作人',
                  aaa: params,
                },
              }, [
                '操作人',
              ]),
              ellipsis: true,
            },
            {
              title: '操作',
              key: '',
              render: (h, params) => {
                if (params.row.id === this.editKey) {
                  return h('div', {
                    style: {
                      fontSize: '12px',
                    },
                  }, [
                    h('span', {
                      style: {
                        marginLeft: '5px',
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          console.log(params.row);
                          this.jwoodMapperUpdate(params.row);
                          this.editKey = '';
                        },
                      },
                    }, '确定'),
                    h('span', {
                      style: {
                        marginLeft: '5px',
                        cursor: 'pointer',
                      },
                      on: {
                        click: () => {
                          this.editKey = '';
                        },
                      },
                    }, '取消'),
                  ]);
                }
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'compose',
                    },
                    style: {
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        this.editKey = params.row.id;
                      },
                    },
                  }),
                ]);
              },
              ellipsis: true,
            },
          ];
        }
      }
    },
    configName() {
      this.$store.state.modify = false;
      if (this.configName === '3') {
        this.title = [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
              },
            }, [params.row.metaid]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: 'ID',
              },
            }, 'metaid'),
            ellipsis: true,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
              },
            }, [params.row.appName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'mapperTagName',
            render: (h, params) => {
              return h('Tooltip', {
                attrs: {
                  content: params.row.mapperTagName,
                },
              }, params.row.mapperTagName);
            },
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtag',
                aaa: params,
              },
            }, [
              'TDtag',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
              },
            }, this.formatDate(params.row.createTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'createTime',
                aaa: params,
              },
            }, [
              'createTime',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
              },
            }, this.formatDate(params.row.updateTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'updateTime',
                aaa: params,
              },
            }, [
              'updateTime',
            ]),
            ellipsis: true,
          },
          {
            key: 'userName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                aaa: params,
                content: params.row.userName,
              },
            }, params.row.userName),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '操作人',
                aaa: params,
              },
            }, [
              '操作人',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.configName === '4') {
        this.title = [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
              },
            }, [params.row.metaid]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: 'ID',
              },
            }, 'metaid'),
            ellipsis: true,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
              },
            }, [params.row.appName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'tdTag',
            render: (h, params) => {
              return h('Tooltip', {
                attrs: {
                  content: params.row.mapperTagName,
                },
              }, params.row.mapperTagName);
            },
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtag',
                aaa: params,
              },
            }, [
              'TDtag',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
              },
            }, this.formatDate(params.row.createTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'create_time',
                aaa: params,
              },
            }, [
              'create_time',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
              },
            }, this.formatDate(params.row.updateTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'update_time',
                aaa: params,
              },
            }, [
              'update_time',
            ]),
            ellipsis: true,
          },
          {
            key: '',
            render: (h, params) => h('Tooltip', {
              attrs: {
                aaa: params,
                content: params.row.userName,
              },
            }, params.row.userName),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '操作人',
                aaa: params,
              },
            }, [
              '操作人',
            ]),
            ellipsis: true,
          },
        ];
      } else if (this.configName === '5') {
        this.title = [
          {
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            key: 'metaid',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.metaid,
              },
            }, [params.row.metaid]),
            renderHeader: h => h('Tooltip', {
              attrs: {
                content: 'ID',
              },
            }, 'metaid'),
            ellipsis: true,
          },
          {
            key: 'appName',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.appName,
              },
            }, [params.row.appName]),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '名称',
                aaa: params,
              },
            }, [
              '名称',
            ]),
            ellipsis: true,
          },
          {
            key: 'tdTag',
            render: (h, params) => {
              return h('Tooltip', {
                attrs: {
                  content: params.row.mapperTagName,
                },
              }, params.row.mapperTagName);
            },
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'TDtag',
                aaa: params,
              },
            }, [
              'TDtag',
            ]),
            ellipsis: true,
          },
          {
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
              },
            }, this.formatDate(params.row.createTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'create_time',
                aaa: params,
              },
            }, [
              'create_time',
            ]),
            ellipsis: true,
          },
          {
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
              },
            }, this.formatDate(params.row.updateTime)),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: 'update_time',
                aaa: params,
              },
            }, [
              'update_time',
            ]),
            ellipsis: true,
          },
          {
            key: '',
            render: (h, params) => h('Tooltip', {
              attrs: {
                aaa: params,
                content: params.row.userName,
              },
            }, params.row.userName),
            renderHeader: (h, params) => h('Tooltip', {
              attrs: {
                content: '操作人',
                aaa: params,
              },
            }, [
              '操作人',
            ]),
            ellipsis: true,
          },
        ];
      }
    },
    tags() {
      if (this.$router.currentRoute.name === 'sorts') {
        if (this.tags.length !== 2) {
          this.title = [
            {
              type: 'selection',
              width: 34,
              align: 'center',
            },
            {
              title: '标签ID',
              key: 'appOriginalName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.id,
                },
              }, [
                params.row.id,
              ]),
              ellipsis: true,
            },
            {
              title: '标签',
              key: 'name',
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: p.row.name,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.name = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('span', {
                    style: {
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                      //  this.$store.state.spinShow = true;
                        if (this.tags.indexOf(params.row.name) === -1) {
                          this.$store.state.tags.pop();
                          this.$store.state.tags.push(p.row);
                          this.$store.state.tags.push('');
                          this.$store.state.currentPage = 1;
                        }
                      },
                    },
                  }, [
                    h('Tooltip', {
                      attrs: {
                        content: params.row.name,
                        class: 'ivu-table-cell-ellipsis',
                      },
                    }, [
                      params.row.name,
                    ]),
                  ]),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '标签code',
              key: 'description',
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: p.row.code,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.code = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('Tooltip', {
                    attrs: {
                      content: p.row.code,
                      class: 'ivu-table-cell-ellipsis',
                    },
                  }, [
                    p.row.code,
                  ]),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '标签描述',
              key: 'description',
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: p.row.description,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.description = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('Tooltip', {
                    attrs: {
                      content: p.row.description,
                      class: 'ivu-table-cell-ellipsis',
                    },
                  }, [
                    p.row.description,
                  ]),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '英文名称',
              key: 'nameEn',
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: p.row.nameEn,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.nameEn = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('Tooltip', {
                    attrs: {
                      content: p.row.nameEn,
                      class: 'ivu-table-cell-ellipsis',
                    },
                  }, [
                    p.row.nameEn,
                  ]),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '标签状态',
              key: 'platform',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.tagSystemFormatState(params.row.status),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.tagSystemFormatState(params.row.status),
              ]),
              ellipsis: true,
            },
            {
              title: '添加日期',
              key: 'preAppName',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.createTime),
              ]),
              ellipsis: true,
              width: 160,
            },
            {
              title: '最后更新日期',
              key: 'packageStatus',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.updateTime),
              ]),
              ellipsis: true,
              width: 160,
            },
            {
              title: '操作',
              key: '',
              width: 150,
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('div', [
                    h('div', [
                      h('i-switch', {
                        attrs: {
                          value: Boolean(params.row.status),
                        },
                        style: {
                          float: 'left',
                          marginRight: '5px',
                        },
                        nativeOn: {
                          click: () => {
                            p.row.status = p.row.status === 0 ? 1 : 0;
                            this.changeTagstate(p.row);
                          },
                        },
                      }),
                      h('span', {
                        attrs: {
                          class: 'edit-btn',
                        },
                        on: {
                          click: () => {
                            this.changeTagInfo(p.row);
                            this.editKey = '';
                          },
                        },
                      }, '确定'),
                      h('span', {
                        attrs: {
                          class: 'edit-btn',
                        },
                        on: {
                          click: () => {
                            this.editKey = '';
                            this.selectTags();
                          },
                        },
                      }, '取消'),
                    ]),
                  ]);
                }
                return h('div', [
                  h('div', [
                    h('i-switch', {
                      attrs: {
                        value: Boolean(p.row.status),
                      },
                      nativeOn: {
                        click: () => {
                          p.row.status = p.row.status === 0 ? 1 : 0;
                          this.changeTagstate(p.row);
                        },
                      },
                    }),
                    h('Button', {
                      props: {
                        type: 'text',
                        icon: 'compose',
                      },
                      style: {
                        marginLeft: '25px',
                        fontSize: '20px',
                      },
                      on: {
                        click: () => {
                          this.editKey = params.row.id;
                        },
                      },
                    }),
                  ]),
                ]);
              },
            },
            {
              title: '设备标签',
              key: '',
              width: 80,
              render: (h, params) => {
                const p = params;
                return h('div', [
                  h('div', [
                    h('i-switch', {
                      attrs: {
                        value: Boolean(params.row.modelStatus),
                      },
                      nativeOn: {
                        click: () => {
                          p.row.modelStatus = p.row.modelStatus === 0 ? 1 : 0;
                          this.changeModelstate(p.row);
                        },
                      },
                    }),
                  ]),
                ]);
              },
            },
          ];
        } else {
          this.title = [
            {
              type: 'selection',
              width: 34,
              align: 'center',
            },
            {
              title: '标签ID',
              key: 'id',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: params.row.id,
                },
              }, [
                params.row.id,
              ]),
              ellipsis: true,
            },
            {
              title: '体系名称',
              key: 'name',
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: p.row.name,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.name = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('span', {
                    style: {
                      cursor: 'pointer',
                    },
                    on: {
                      click: () => {
                      //  this.$store.state.spinShow = true;
                        if (this.tags.indexOf(params.row.name) === -1) {
                          this.$store.state.tags.pop();
                          this.$store.state.tags.push(params.row);
                          this.$store.state.tags.push('');
                        }
                      },
                    },
                  }, [
                    h('Tooltip', {
                      attrs: {
                        content: params.row.name,
                        class: 'ivu-table-cell-ellipsis',
                      },
                    }, [
                      params.row.name,
                    ]),
                  ]),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '标签体系描述',
              key: 'description',
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('Input', {
                    props: {
                      value: p.row.description,
                      autofocus: true,
                    },
                    on: {
                      input: (val) => {
                        p.row.description = val;
                      },
                    },
                  });
                }
                return h('div', [
                  h('Tooltip', {
                    attrs: {
                      content: params.row.description,
                      class: 'ivu-table-cell-ellipsis',
                    },
                  }, [
                    params.row.description,
                  ]),
                ]);
              },
              ellipsis: true,
            },
            {
              title: '状态',
              key: 'status',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.tagSystemFormatState(params.row.status),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.tagSystemFormatState(params.row.status),
              ]),
              ellipsis: true,
            },
            {
              title: '添加日期',
              key: 'createTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.createTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.createTime),
              ]),
              ellipsis: true,
            },
            {
              title: '最后更新日期',
              key: 'updateTime',
              render: (h, params) => h('Tooltip', {
                attrs: {
                  content: this.formatDate(params.row.updateTime),
                  class: 'ivu-table-cell-ellipsis',
                },
              }, [
                this.formatDate(params.row.updateTime),
              ]),
              ellipsis: true,
            },
            {
              title: '操作',
              key: '',
              width: 150,
              render: (h, params) => {
                const p = params;
                if (p.row.id === this.editKey) {
                  return h('div', [
                    h('div', [
                      h('i-switch', {
                        attrs: {
                          value: Boolean(params.row.status),
                        },
                        style: {
                          float: 'left',
                          marginRight: '5px',
                        },
                        nativeOn: {
                          click: () => {
                            p.row.status = p.row.status === 0 ? 1 : 0;
                            this.changeTagstate(p.row);
                          },
                        },
                      }),
                      h('span', {
                        attrs: {
                          class: 'edit-btn',
                        },
                        on: {
                          click: () => {
                            this.changeTagInfo(p.row);
                            this.editKey = '';
                          },
                        },
                      }, '确定'),
                      h('span', {
                        attrs: {
                          class: 'edit-btn',
                        },
                        on: {
                          click: () => {
                            this.editKey = '';
                            this.getTagSystems();
                          },
                        },
                      }, '取消'),
                    ]),
                  ]);
                }
                return h('div', [
                  h('div', [
                    h('i-switch', {
                      attrs: {
                        value: Boolean(p.row.status),
                      },
                      nativeOn: {
                        click: () => {
                          p.row.status = p.row.status === 0 ? 1 : 0;
                          this.changeTagstate(p.row);
                        },
                      },
                    }),
                    h('Button', {
                      props: {
                        type: 'text',
                        icon: 'compose',
                      },
                      style: {
                        marginLeft: '25px',
                        fontSize: '20px',
                      },
                      on: {
                        click: () => {
                          this.editKey = params.row.id;
                        },
                      },
                    }),
                  ]),
                ]);
              },
            },
            {
              title: '设备标签',
              key: '',
              width: 80,
              render: (h, params) => {
                const p = params;
                return h('div', [
                  h('div', [
                    h('i-switch', {
                      attrs: {
                        value: Boolean(params.row.modelStatus),
                      },
                      nativeOn: {
                        click: () => {
                          p.row.modelStatus = p.row.modelStatus === 0 ? 1 : 0;
                          this.changeModelstate(p.row);
                        },
                      },
                    }),
                  ]),
                ]);
              },
            },
          ];
        }
        if (this.tags[0].name === 'BaseCode标签') {
          this.title.splice(4, 0, {
            title: '关联标签',
            key: 'relationTagName',
            render: (h, params) => h('Tooltip', [
              h('p', params.row.relationTagName),
              h('div', {
                slot: 'content',
              },
              String(params.row.relationTagName).split(',').map(pkg => h('p', pkg)),
            ),
            ]),
            ellipsis: true,
          });
          this.title[this.title.length - 1] = {
            title: '操作',
            key: '',
            render: (h, params) => h('div', [
              h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    icon: 'compose',
                  },
                  style: {
                    marginLeft: '25px',
                    fontSize: '20px',
                  },
                  on: {
                    click: () => {
                      this.$store.state.showEditTag = true;
                      this.$store.state.editAppInfo = params.row;
                    },
                  },
                }),
              ]),
            ]),
          };
        }
      }
    },
    resultTitles() {
      const temp = [
        {
          type: 'selection',
          width: 34,
          align: 'center',
        },
      ];
      this.resultTitles.forEach((item) => {
        const obj = {
          key: item.value,
          render: '',
          title: item.label,
          ellipsis: true,
        };
        if (item.value === 'createtime') {
          obj.render = (h, params) => {
            if (params.row.id === this.editKey) {
              return h('div', [
                h('DatePicker', {
                  props: {
                    type: 'date',
                    value: this.formatDate2(params.row[item.value]),
                  },
                  on: {
                    'on-change': (val) => {
                      params.row[item.value] = new Date(val);
                    },
                  },
                }),
              ]);
            }
            return h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row[item.value]),
                aaa: params,
              },
            }, this.formatDate(params.row[item.value]));
          };
        } else if (item.value === 'updatetime') {
          obj.render = (h, params) => {
            if (params.row.id === this.editKey) {
              return h('div', [
                h('DatePicker', {
                  props: {
                    type: 'date',
                    value: this.formatDate2(params.row[item.value]),
                  },
                  on: {
                    'on-change': (val) => {
                      params.row[item.value] = new Date(val);
                    },
                  },
                }),
              ]);
            }
            return h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row[item.value]),
                aaa: params,
              },
            }, this.formatDate(params.row[item.value]));
          };
        } else if (item.value === 'startdate') {
          obj.render = (h, params) => {
            if (params.row.id === this.editKey) {
              return h('div', [
                h('DatePicker', {
                  props: {
                    type: 'date',
                    value: this.formatDate2(params.row[item.value]),
                  },
                  on: {
                    'on-change': (val) => {
                      params.row[item.value] = new Date(val);
                    },
                  },
                }),
              ]);
            }
            return h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row[item.value]),
                aaa: params,
              },
            }, this.formatDate(params.row[item.value]));
          };
        } else if (item.value === 'enddate') {
          obj.render = (h, params) => {
            if (params.row.id === this.editKey) {
              return h('div', [
                h('DatePicker', {
                  props: {
                    type: 'date',
                    value: this.formatDate2(params.row[item.value]),
                  },
                  on: {
                    'on-change': (val) => {
                      params.row[item.value] = new Date(val);
                    },
                  },
                }),
              ]);
            }
            return h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row[item.value]),
                aaa: params,
              },
            }, this.formatDate(params.row[item.value]));
          };
        } else if (item.value === 'name') {
          obj.render = (h, params) => {
            const p = params;
            if (params.row.id === this.editKey) {
              return h('Input', {
                props: {
                  value: params.row[item.value],
                  autofocus: true,
                },
                on: {
                  input: (val) => {
                    p.row[item.value] = val;
                  },
                },
              });
            }
            return h('div', [
              h('span', {
                style: {
                  cursor: 'pointer',
                },
                on: {
                  click: () => {
                    this.jwoodTags.pop();
                    this.jwoodTags.push(params.row);
                    this.jwoodTags.push('');
                    this.$store.state.groupId = params.row.id;
                    console.log(this.$store.state.parentcode);
                  },
                },
              }, [h('Tooltip', {
                attrs: {
                  content: params.row[item.value],
                },
              }, [params.row[item.value]])]),
            ]);
          };
        } else {
          // obj.render = (h, params) => h('Tooltip', {
          //   attrs: {
          //     content: params.row[item.value],
          //     aaa: params,
          //   },
          // }, params.row[item.value]);
          obj.render = (h, params) => {
            const p = params;
            if (params.row.id === this.editKey) {
              return h('Input', {
                props: {
                  value: params.row[item.value],
                  autofocus: true,
                },
                on: {
                  input: (val) => {
                    p.row[item.value] = val;
                  },
                },
              });
            }
            return h('Tooltip', {
              attrs: {
                content: params.row[item.value],
              },
            }, params.row[item.value]);
          };
        }
        temp.push(obj);
      });
      temp.push(
        {
          title: '操作',
          key: '',
          render: (h, params) => {
            if (params.row.id === this.editKey) {
              return h('div', {
                style: {
                  fontSize: '12px',
                },
              }, [
                h('span', {
                  style: {
                    marginLeft: '5px',
                    cursor: 'pointer',
                  },
                  on: {
                    click: () => {
                      this.jwoodjmTagsUpdate(params.row);
                      this.editKey = '';
                    },
                  },
                }, '确定'),
                h('span', {
                  style: {
                    marginLeft: '5px',
                    cursor: 'pointer',
                  },
                  on: {
                    click: () => {
                      this.editKey = '';
                    },
                  },
                }, '取消'),
              ]);
            }
            return h('div', [
              h('i-switch', {
                attrs: {
                  value: true,
                },
                nativeOn: {
                  click: () => {
                    console.log(111);
                  },
                },
              }),
              h('Button', {
                props: {
                  type: 'text',
                  icon: 'compose',
                },
                style: {
                  fontSize: '20px',
                  marginLeft: '20px',
                },
                on: {
                  click: () => {
                    this.editKey = params.row.id;
                  },
                },
              }),
            ]);
          },
          ellipsis: true,
        });
      this.title = temp;
    },
    resultShowTitles() {
//      this.$store.state.stepVal = 0;
//      this.$store.state.stepVal = this.viewPower[0] - 1;
//      对选择的需要展示的title进行格式转换
      console.log(this.resultShowTitles);
      const self = this;
      const temp = [
        {
          type: 'selection',
          width: 34,
          align: 'center',
        },
      ];
      this.resultShowTitles.forEach((item) => {
        const obj = {
          key: item.value,
          render: '',
          renderHeader: (h, params) => h('Tooltip', {
            attrs: {
              content: item.label,
              aaa: params,
            },
          }, [
            item.label,
          ]),
          ellipsis: true,
        };
        if (item.value.substr(item.value.length - 4) === 'Time') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatDate(params.row[item.value]),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatDate(params.row[item.value]),
          ]);
          obj.renderHeader = (h, params) => h('Tooltip', {
            attrs: {
              content: item.label,
              aaa: params,
            },
            class: 'creat-time',
          }, [
            item.label,
          ]);
          obj.sortable = 'custom';
        } else if (item.value === 'metaId' || item.value === 'metaid') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: params.row[item.value],
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row[item.value],
          ]);
          obj.renderHeader = (h, params) => h('Tooltip', {
            attrs: {
              content: item.label,
              aaa: params,
            },
            class: 'creat-time',
          }, [
            item.label,
          ]);
          obj.sortable = 'custom';
        } else if (item.value === 'merge' && this.stepVal === 5) {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: params.row[item.value],
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row[item.value],
          ]);
          obj.renderHeader = (h, params) => h('Tooltip', {
            attrs: {
              content: item.label,
              aaa: params,
            },
            class: 'creat-time',
          }, [
            item.label,
          ]);
          obj.sortable = 'custom';
        } else if (item.value === 'packageStatus') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: this.handleState(params.row[item.value]),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.handleState(params.row[item.value]),
          ]);
          obj.width = 100;
        } else if (item.value === 'appStatus' && self.stepVal !== 5) {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: this.handleState(params.row[item.value]),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatAppStatus(params.row[item.value]),
          ]);
          obj.width = 100;
        } else if (item.value === 'appStatus' && self.stepVal === 5) {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatAppStatus(params.row[item.value]),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatAppStatus(params.row[item.value]),
          ]);
          obj.width = 100;
        } else if (item.value === 'userName') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: params.row[item.value],
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row[item.value],
          ]);
          obj.width = 70;
        } else if (item.value === 'checkUser') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: params.row[item.value],
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row[item.value],
          ]);
          obj.width = 70;
        } else if (item.value === 'platform') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatPlatorm(params.row[item.value]),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatPlatorm(params.row[item.value]),
          ]);
          obj.width = 100;
        } else if (item.value === 'sourceId') {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: this.formatSource(params.row[item.value]),
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            this.formatSource(params.row[item.value]),
          ]);
          obj.width = 100;
        } else if (item.value === 'matchCount') {
          obj.renderHeader = (h, params) => h('Tooltip', {
            attrs: {
              content: item.label,
              aaa: params,
            },
            class: 'creat-time',
          }, [
            item.label,
          ]);
          obj.sortable = 'custom';
          obj.width = 90;
        } else if (item.value === 'appCategory') {
          let str = '';
          obj.render = (h, params) => {
            str = params.row[item.value];
            return h('Tooltip', {
              attrs: {
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              h('p', str),
              h('div', {
                slot: 'content',
              },
                str.split(',').map(pkg => h('p', pkg)),
              ),
            ]);
          };
        } else if (item.value === 'pkgTagCodeName') {
          let str = '';
          obj.render = (h, params) => {
            if (params.row[item.value].indexOf(',')) {
              str = '';
              params.row[item.value].split(',').forEach((todo) => {
                if (todo.split('/')[0] === 'TD分类') {
                  str += `${todo},`;
                }
              });
              str = str.substring(0, str.length - 1);
            } else if (params.row[item.value].split('/')[0] === 'TD分类' && !params.row[item.value].indexOf(',')) {
              str = params.row[item.value];
            }
            console.log(str);
            return h('Tooltip', {
              attrs: {
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              h('p', str),
              h('div', {
                slot: 'content',
              },
                str.split(',').map(pkg => h('p', pkg)),
              ),
            ]);
          };
        } else if (item.value === 'pkgTagName') {
          // obj.render = (h, params) => h('Tooltip', {
          //   attrs: {
          //     content: params.row[item.value],
          //     class: 'ivu-table-cell-ellipsis',
          //   },
          // }, [
          //   params.row[item.value],
          // ]);
          obj.render = (h, params) => {
            const tmp = [];
            const tmp2 = [];
            const tmp3 = [];
            const val = params.row.pkgDetails;
            if (val !== null && val !== undefined) {
            //  console.log(val);
              val.forEach((todo) => {
                if (todo.sourceName === 'BaseType') {
                  tmp.push(todo.pkgName);
                } else if (todo.sourceName === 'TD分类') {
                  tmp2.push(todo.pkgName);
                } else {
                  tmp3.push(todo.pkgName);
                }
              });
            }
            return h('Tooltip', [
              h('p', tmp2.join(',')),
              h('div', {
                slot: 'content',
              },
                tmp2.map(pkg => h('p', pkg)),
              ),
            ]);
          };
          obj.renderHeader = (h, params) => h('Tooltip', {
            attrs: {
              content: item.label,
              aaa: params,
            },
            class: 'create-pop',
          }, [
            item.label,
          ]);
          // obj.filters = [
          //   { label: 'BaseType', value: 1 },
          //   { label: 'TD分类', value: 2 },
          //   { label: 'TD标签', value: 3 },
          // ];
          // obj.filterMultiple = false;
          // obj.filterMethod = (value) => {
          //   if (value === 1) {
          //     obj.render = (h, params) => {
          //       const tmp = [];
          //       const tmp2 = [];
          //       const tmp3 = [];
          //       const val = params.row[key];
          //       if (val !== '') {
          //         val.split(',').forEach((todo) => {
          //           const type = todo.split('/')[0];
          //           if (type === 'BaseType') {
          //             tmp.push(todo);
          //           } else if (type === 'TD分类') {
          //             tmp2.push(todo);
          //           } else {
          //             tmp3.push(todo);
          //           }
          //         });
          //       }
          //       return h('Tooltip', [
          //         h('p', tmp.join(',')),
          //         h('div', {
          //           slot: 'content',
          //         },
          //           tmp.map(pkg => h('p', pkg)),
          //         ),
          //       ]);
          //     };
          //   } else if (value === 2) {
          //     obj.render = (h, params) => {
          //       const tmp = [];
          //       const tmp2 = [];
          //       const tmp3 = [];
          //       const val = params.row[key];
          //       if (val !== '') {
          //         val.split(',').forEach((todo) => {
          //           const type = todo.split('/')[0];
          //           if (type === 'BaseType') {
          //             tmp.push(todo);
          //           } else if (type === 'TD分类') {
          //             tmp2.push(todo);
          //           } else {
          //             tmp3.push(todo);
          //           }
          //         });
          //       }
          //       return h('Tooltip', [
          //         h('p', tmp2.join(',')),
          //         h('div', {
          //           slot: 'content',
          //         },
          //           tmp2.map(pkg => h('p', pkg)),
          //         ),
          //       ]);
          //     };
          //   } else {
          //     obj.render = (h, params) => {
          //       const tmp = [];
          //       const tmp2 = [];
          //       const tmp3 = [];
          //       const val = params.row[key];
          //       if (val !== '') {
          //         val.split(',').forEach((todo) => {
          //           const type = todo.split('/')[0];
          //           if (type === 'BaseType') {
          //             tmp.push(todo);
          //           } else if (type === 'TD分类') {
          //             tmp2.push(todo);
          //           } else {
          //             tmp3.push(todo);
          //           }
          //         });
          //       }
          //       return h('Tooltip', [
          //         h('p', tmp3.join(',')),
          //         h('div', {
          //           slot: 'content',
          //         },
          //           tmp3.map(pkg => h('p', pkg)),
          //         ),
          //       ]);
          //     };
          //   }
          // };
        } else if (item.value === 'appName' && this.stepVal === 1) {
          obj.render = (h, params) => h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'small',
              },
              on: {
                click: () => {
                  this.$store.state.dataDetails = [];
                  this.$store.state.showDetails = true;
                  this.$store.state.dataDetails.push(params.row);
                },
              },
            }, params.row[item.value]),
          ]);
        } else if (item.value === 'standardName') {
          obj.render = (h, params) => h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'small',
              },
              on: {
                click: () => {
                  this.$store.state.dataDetails = [];
                  this.$store.state.showDetails = true;
                  this.$store.state.dataDetails.push(params.row);
                },
              },
            }, params.row[item.value]),
          ]);
        } else if ((item.value === 'referenceUrl' && this.stepVal === 3) || (item.value === 'iconUrl' && this.stepVal === 3)) {
          obj.render = (h, params) => h('div', [
            h('Button', {
              props: {
                type: 'text',
                size: 'small',
              },
              on: {
                click: () => {
                  const key = item.value;
                  window.open(params.row[key]);
                },
              },
            }, params.row[item.value]),
          ]);
        } else {
          obj.render = (h, params) => h('Tooltip', {
            attrs: {
              content: params.row[item.value],
              class: 'ivu-table-cell-ellipsis',
            },
          }, [
            params.row[item.value],
          ]);
        }
        temp.push(obj);
      });
      if (this.stepVal === 2 || this.stepVal === 5) {
        temp.push({
          title: '编辑',
          key: 'edit',
          render: (h, params) => h('Button', {
            props: {
              type: 'text',
              icon: 'compose',
            },
            style: {
              fontSize: '22px',
            },
            on: {
              click: () => {
                if (this.stepVal === 2 && params.row.packageStatus === 14) {
                  this.$Message.warning(' 此状态的数据不允许编辑');
                } else {
                  this.$store.state.showEdit = true;
                  console.log(params.row);
                  this.$store.state.editAppInfo = params.row;
                }
              },
            },
          }),
          ellipsis: true,
          width: 50,
        });
      }
      this.title = temp;
    },
    listContent() {
      this.allList = this.listContent;
    },
    isGet() {
      if (this.$router.currentRoute.name === 'sorts') {
        this.getRelationTags();
      }
    },
    manageType() {
      this.$store.state.showJurisdiction = false;
      if (this.manageType === 1) {
        this.title = [
          {
            type: 'selection',
            width: 34,
            align: 'center',
          },
          {
            title: '用户名',
            key: 'displayName',
            width: 120,
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.displayName,
              },
            }, [
              params.row.displayName,
            ]),
            ellipsis: true,
          },
          {
            title: '邮箱',
            key: 'email',
            width: 200,
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.email,
              },
            }, [
              params.row.email,
            ]),
            ellipsis: true,
          },
          {
            title: '用户角色',
            key: 'roleInfo',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.roleInfo,
              },
            }, [
              params.row.roleInfo,
            ]),
            ellipsis: true,
          },
          {
            title: '添加日期',
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            title: '操作',
            key: '',
            width: 120,
            render: (h, params) => {
              const p = params;
              return h('div', [
                h('div', [
                  h('i-switch', {
                    attrs: {
                      value: Boolean(params.row.status),
                    },
                    nativeOn: {
                      click: () => {
                        p.row.status = p.row.status === 0 ? 1 : 0;
                        this.$Message.loading({
                          duration: 0,
                          content: '上传中',
                        });
                        const self = this;
                        const temp = {
                          data: p.row,
                          callback() {
                            self.$Message.destroy();
                            self.$Notice.success({
                              title: '提示',
                              desc: '修改成功',
                            });
                          },
                        };
                        this.changeUser(temp);
                      },
                    },
                  }),
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'compose',
                    },
                    style: {
                      marginLeft: '25px',
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        this.$store.state.showAdd = !this.showAdd;
                        this.$store.state.manageUserInfo = params.row;
                      },
                    },
                  }),
                ]),
              ]);
            },
          },
        ];
      } else if (this.manageType === 2) {
        this.title = [
          {
            type: 'selection',
            width: 34,
            align: 'center',
          },
          {
            title: '角色名',
            key: 'name',
            width: 120,
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.name,
              },
            }, [
              params.row.name,
            ]),
            ellipsis: true,
          },
          {
            title: '角色权限',
            key: 'powerInfo',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.powerInfo,
              },
            }, [
              params.row.powerInfo,
            ]),
            ellipsis: true,
          },
          {
            title: '更新日期',
            key: 'updateTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.updateTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.updateTime),
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            title: '操作',
            key: '',
            width: 120,
            render: (h, params) => {
              const p = params;
              return h('div', [
                h('div', [
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'compose',
                    },
                    style: {
                      marginLeft: '25px',
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        this.$store.state.RoleInfo = params.row;
                        this.$store.state.showJurisdiction = !this.showJurisdiction;
                      },
                    },
                  }),
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'ios-trash-outline',
                    },
                    style: {
                      marginLeft: '25px',
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        this.delRole(p.row);
                      },
                    },
                  }),
                ]),
              ]);
            },
          },
        ];
      } else if (this.manageType === 3) {
        this.title = [
          {
            type: 'selection',
            width: 34,
            align: 'center',
          },
          {
            title: '用户名',
            key: 'displayName',
            width: 120,
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.displayName,
              },
            }, [
              params.row.displayName,
            ]),
            ellipsis: true,
          },
          {
            title: '邮箱',
            key: 'email',
            width: 200,
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.email,
              },
            }, [
              params.row.email,
            ]),
            ellipsis: true,
          },
          {
            title: '用户角色',
            key: 'roleInfo',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: params.row.roleInfo,
              },
            }, [
              params.row.roleInfo,
            ]),
            ellipsis: true,
          },
          {
            title: '添加日期',
            key: 'createTime',
            render: (h, params) => h('Tooltip', {
              attrs: {
                content: this.formatDate(params.row.createTime),
                class: 'ivu-table-cell-ellipsis',
              },
            }, [
              this.formatDate(params.row.createTime),
            ]),
            ellipsis: true,
            width: 160,
          },
          {
            title: '操作',
            key: '',
            width: 120,
            render: (h, params) => {
              const p = params;
              return h('div', [
                h('div', [
                  h('i-switch', {
                    attrs: {
                      value: Boolean(params.row.status),
                    },
                    nativeOn: {
                      click: () => {
                        p.row.status = p.row.status === 0 ? 1 : 0;
                        this.$Message.loading({
                          duration: 0,
                          content: '上传中',
                        });
                        const self = this;
                        const temp = {
                          data: p.row,
                          callback() {
                            self.$Message.destroy();
                            self.$Notice.success({
                              title: '提示',
                              desc: '修改成功',
                            });
                          },
                        };
                        this.changeUser(temp);
                      },
                    },
                  }),
                  h('Button', {
                    props: {
                      type: 'text',
                      icon: 'compose',
                    },
                    style: {
                      marginLeft: '25px',
                      fontSize: '20px',
                    },
                    on: {
                      click: () => {
                        this.$store.state.showAdd = !this.showAdd;
                        this.$store.state.manageUserInfo = params.row;
                      },
                    },
                  }),
                ]),
              ]);
            },
          },
        ];
      }
    },
  },
  beforeDestroy() {
//  离开的时候还原初始状态
    this.title = [];
    this.$store.state.currentPage = 1;
  },
};
</script>
