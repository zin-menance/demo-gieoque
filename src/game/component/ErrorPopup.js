export default class ErrorPopup {

  static show(scene, message = "Lỗi hệ thống\nXin vui lòng thử lại sau") {

      const cam = scene.cameras.main;

      const bg = scene.add.rectangle(
          cam.centerX,
          cam.centerY,
          420, 160,
          0x000000,
          0.65
      ).setOrigin(0.5);

      const txt = scene.add.text(
          cam.centerX,
          cam.centerY,
          message,
          {
              fontSize: "28px",
              color: "#ffffff",
              align: "center"
          }
      ).setOrigin(0.5);

      // Auto hide after 2 seconds
      scene.time.delayedCall(2000, () => {
          bg.destroy();
          txt.destroy();
      });
  }
}
