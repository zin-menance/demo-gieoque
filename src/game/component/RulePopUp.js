export default class RulesPopup {
  constructor(scene) {
      this.scene = scene;
      this.container = null;
  }

  show() {
      if (this.container) return; // Already showing

      const { width, height } = this.scene.scale;
      const angle = -5 

      // Create main container
      this.container = this.scene.add.container(width / 2, height / 2).setDepth(1000);

      // Dark overlay background
      const overlay = this.scene.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0)
          .setOrigin(0.5)
          .setInteractive();
      
      overlay.on('pointerdown', () => this.hide());

      // Dynamic paper size
      const paperWidth = Math.min(500, width * 0.8);
      const paperHeight = Math.min(750, height * 0.8);
      const shadowOffset = Math.max(8, paperWidth * 0.02); // relative shadow offset

      // Shadow
      const shadow = this.scene.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRoundedRect(-paperWidth / 2 + shadowOffset, -paperHeight / 2 + shadowOffset, paperWidth, paperHeight, 15);
      shadow.setAngle(angle);

      // Main paper
      const paper = this.scene.add.graphics();
      paper.fillStyle(0xffffff, 1);
      paper.fillRoundedRect(-paperWidth / 2, -paperHeight / 2, paperWidth, paperHeight, 15);
      paper.setAngle(angle);

      // Decorative border
      const border = this.scene.add.graphics();
      border.lineStyle(Math.max(2, paperWidth * 0.006), 0xffd700, 1);
      border.strokeRoundedRect(-paperWidth / 2 + 20, -paperHeight / 2 + 20, paperWidth - 40, paperHeight - 40, 10);
      border.setAngle(angle);

      // Red banner at top
      const banner = this.scene.add.graphics();
      const bannerWidth = paperWidth * 0.36;
      const bannerHeight = paperHeight * 0.05;
      banner.fillStyle(0xd32f2f, 1);
      banner.fillEllipse(0, -paperHeight / 2 + bannerHeight * 2, bannerWidth, bannerHeight);
      banner.setAngle(angle);

      // Title text on banner
      const title = this.scene.add.text(0, -paperHeight / 2 + bannerHeight * 2, 'HƯỚNG DẪN', {
          fontFamily: '"Inter", sans-serif',
          fontSize: `${Math.floor(paperWidth * 0.045)}px`, // relative font size
          color: '#ffffff',
          fontStyle: 'bold'
      }).setOrigin(0.5).setAngle(angle);

      // Rules content
      const rulesText = `
CÁCH NHẬN LƯỢT GIEO QUẺ:

• Đăng ký tài khoản thành công: Nhận 1 lượt gieo quẻ
• Hoàn thành dịch vụ trên app Bship: Nhận thêm 1 lượt
• Mời bạn bè đăng ký: Cả 2 nhận 1 lượt (tối đa 3 bạn/ngày)

QUY ĐỊNH CHUNG:

1. Bship có quyền sử dụng hình ảnh khách hàng may mắn 
 vĩnh viễn cho mục đích quảng bá và truyền thông.

2. Giải thưởng không quy đổi tiền mặt hay chuyển nhượng.

3. Khách hàng tự chi trả thuế và chi phí phát sinh 
 (đi lại, ăn ở, vận chuyển).

4. Bship có quyền thay đổi điều khoản hoặc kết thúc 
 chương trình không cần thông báo.

5. Quyết định cuối cùng về tranh chấp thuộc về Bship.

6. Liên hệ hotline: 1900 9253
      `.trim();

      const content = this.scene.add.text(0, -paperHeight * 0.05, rulesText, {
          fontFamily: '"Inter", sans-serif',
          fontSize: `${Math.floor(paperWidth * 0.035)}px`,
          color: '#333333',
          align: 'left',
          lineSpacing: Math.floor(paperWidth * 0.015),
          wordWrap: { width: paperWidth - 80 }
      }).setOrigin(0.5).setAngle(angle);

      // Add all elements to container
      this.container.add([overlay, shadow, paper, border, banner, title, content]);

      // Entrance animation
      this.container.setAlpha(0);
      this.container.setScale(0.7);
      
      this.scene.tweens.add({
          targets: this.container,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 400,
          ease: 'Back.easeOut'
      });
  }

  hide() {
      if (!this.container) return;

      this.scene.tweens.add({
          targets: this.container,
          alpha: 0,
          scaleX: 0.7,
          scaleY: 0.7,
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
              this.container.destroy();
              this.container = null;
          }
      });
  }
}
