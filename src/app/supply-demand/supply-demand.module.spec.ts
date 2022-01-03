import { SupplyDemandModule } from './supply-demand.module';

describe('SupplyDemandModule', () => {
  let supplyDemandModule: SupplyDemandModule;

  beforeEach(() => {
    supplyDemandModule = new SupplyDemandModule();
  });

  it('should create an instance', () => {
    expect(supplyDemandModule).toBeTruthy();
  });
});
