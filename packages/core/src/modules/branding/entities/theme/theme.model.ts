import { Colors, Typography, Borders, WidgetBlock, PageBackground, BinaryTheme } from "../../interface";
import { ThemeType } from "./theme.schema";

export class Theme implements ThemeType {
    org_id: string;
    theme_id: string;
    colors: Colors;
    fonts: Typography;
    borders: Borders;
    widget: WidgetBlock;
    page_background: PageBackground;
    mode: BinaryTheme;
}

export type PK_Theme = Pick<Theme, 'org_id' | 'theme_id'>;