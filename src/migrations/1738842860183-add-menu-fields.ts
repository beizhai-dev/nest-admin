import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMenuFields1738842860183 implements MigrationInterface {
  name = 'AddMenuFields1738842860183'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sys_menu\` 
        ADD COLUMN \`icon_type\` char(1) NULL COMMENT '图标类型：1-字体图标，2-自定义SVG',
        ADD COLUMN \`constant\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否为常量路由：0-否，1-是',
        ADD COLUMN \`href\` varchar(255) NULL COMMENT '外链链接',
        ADD COLUMN \`multi_tab\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否可多开标签页：0-否，1-是',
        ADD COLUMN \`fixed_index_in_tab\` int NULL COMMENT '固定在页签中的序号',
        ADD COLUMN \`path_params\` json NULL COMMENT '路径参数',
        ADD COLUMN \`route_name\` varchar(255) NULL COMMENT '路由名称',
        ADD COLUMN \`i18n_key\` varchar(255) NULL COMMENT '国际化翻译key',
        ADD COLUMN \`hide_in_menu\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否隐藏菜单：0-否，1-是'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`sys_menu\` 
        DROP COLUMN \`route_name\`,
        DROP COLUMN \`path_params\`,
        DROP COLUMN \`fixed_index_in_tab\`,
        DROP COLUMN \`multi_tab\`,
        DROP COLUMN \`href\`,
        DROP COLUMN \`constant\`,
        DROP COLUMN \`icon_type\`,
        DROP COLUMN \`i18n_key\`,
        DROP COLUMN \`hide_in_menu\``,
    )
  }
}
