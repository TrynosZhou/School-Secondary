import { Injectable } from '@angular/core';
import { Residence } from './enrolment/models/residence.enum';
import { FeesNames } from './finance/enums/fees-names.enum';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor() {}

  calculateAge(dateOfBirth: string | Date | undefined): number | undefined {
    if (!dateOfBirth) {
      return undefined; // Handle cases where date of birth is not provided
    }

    const birthDate =
      typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;

    if (isNaN(birthDate.getTime())) {
      return undefined; // Handle invalid date strings
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  residenceToString(residence: Residence) {
    switch (residence) {
      case Residence.Boarder:
        return 'Boarder';
      case Residence.Day:
        return 'Day';
        // case Residence.DayFood:
        //   return 'Day With Food';
        // case Residence.DayTransport:
        //   return 'Day With Transport';
        // case Residence.DayFoodTransport:
        return 'Day With Food and Transport';
    }
  }

  feesNamesToString(feesName: FeesNames): string {
    switch (feesName) {
      case FeesNames.aLevelApplicationFee:
        return 'A Level Application Fee';
      case FeesNames.aLevelTuitionBoarder:
        return 'A Level Boarder Tuition';
      case FeesNames.aLevelTuitionDay:
        return 'A Level Day Tuition';
      case FeesNames.alevelScienceFee:
        return 'A Level Science Fee';
      case FeesNames.deskFee:
        return 'Desk Fee';
      case FeesNames.developmentFee:
        return 'Development Fee';
      case FeesNames.foodFee:
        return 'Food Fee';
      case FeesNames.oLevelApplicationFee:
        return 'O Level Application Fee';
      case FeesNames.oLevelScienceFee:
        return 'O Level Science Fee';
      case FeesNames.oLevelTuitionBoarder:
        return 'O Level Boarder Tuition';
      case FeesNames.oLevelTuitionDay:
        return 'O Level Day Tuition';
      case FeesNames.transportFee:
        return 'Transport Fee';
      case FeesNames.groomingFee:
        return 'Grooming Fee';
      case FeesNames.brokenFurnitureFee:
        return 'Broken Furniture Fee';
      case FeesNames.lostBooksFee:
        return 'Lost Books Fee';
      case FeesNames.miscellaneousCharge:
        return 'Miscellaneous Charge';
      default:
        return feesName;
    }
  }
}
