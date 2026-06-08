export function createRasterApi(runtime) {
  return {
    raster(line, handler) {
      runtime.addRasterHandler(line, handler);
    },
    rasterLoop(line, handler, options = {}) {
      runtime.addRasterHandler(line, handler);
      if (options.disableKernalTimer) {
        runtime.disableKernalTimerIrq();
        runtime.pushInstruction("irqDisableKernalTimer");
      }
      if (options.chainToKernal !== false) {
        runtime.setChainToKernal();
        runtime.pushInstruction("irqChainToKernal");
      }
      if (options.install !== false) {
        runtime.pushInstruction("irqInstall");
      }
    },
    install() {
      runtime.pushInstruction("irqInstall");
    },
    ack() {
      runtime.pushInstruction("irqAck");
    },
    chainToKernal() {
      runtime.setChainToKernal();
      runtime.pushInstruction("irqChainToKernal");
    },
    disableKernalTimer() {
      runtime.disableKernalTimerIrq();
      runtime.pushInstruction("irqDisableKernalTimer");
    },
    enableKernalTimer() {
      runtime.enableKernalTimerIrq();
      runtime.pushInstruction("irqEnableKernalTimer");
    }
  };
}
