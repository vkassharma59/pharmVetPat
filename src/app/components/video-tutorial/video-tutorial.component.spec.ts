import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTutorialComponent } from './video-tutorial.component';

describe('VideoTutorialComponent', () => {
  let component: VideoTutorialComponent;
  let fixture: ComponentFixture<VideoTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTutorialComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
