import { breedDefinitions } from '@/content/breeds/definitions';
import { companyScaleDefinitions } from '@/content/companyScales/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';

describe('content integrity', () => {
  it('keeps breed specialties aligned to a role specialty and modifier surface', () => {
    expect(breedDefinitions).toHaveLength(4);
    for (const breed of breedDefinitions) {
      expect(breed.specialtyRoleId).toBeDefined();
      expect(breed.modifierProfile.productivityMultiplier).toBeGreaterThan(0);
      expect(breed.modifierProfile.qualityMultiplier).toBeGreaterThan(0);
      expect(breed.roleMatches.length).toBeGreaterThan(0);
    }
  });

  it('defines the early hire ladder with unlock and cost intent', () => {
    const roleIds = roleDefinitions.map((role) => role.id);

    expect(roleIds).toEqual(['founder', 'designer', 'pm', 'architect', 'qa']);
    expect(roleDefinitions[1].hireCost.cash).toBeGreaterThan(0);
    expect(roleDefinitions[2].unlockRequirement.companyStage).toBeGreaterThan(roleDefinitions[1].unlockRequirement.companyStage);
    expect(roleDefinitions[4].modifierProfile.qualityMultiplier).toBeGreaterThan(roleDefinitions[1].modifierProfile.qualityMultiplier);
  });

  it('defines a company scale ladder and SDLC mode modifiers', () => {
    expect(companyScaleDefinitions).toHaveLength(4);
    expect(companyScaleDefinitions[0].headcountCap).toBeLessThan(companyScaleDefinitions[3].headcountCap);
    expect(processModeDefinitions).toHaveLength(3);
    expect(processModeDefinitions[0].modifierProfile.qualityMultiplier).toBeGreaterThan(1);
    expect(processModeDefinitions[2].modifierProfile.productivityMultiplier).toBeGreaterThan(1);
  });
});
